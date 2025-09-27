import { createPublicClient, http, isAddress, formatEther, getAddress } from 'viem';
import { base } from 'viem/chains';
import type { 
  Transaction, 
  AddressAnalytics, 
  DailyActivity, 
  MonthlyActivity, 
  ActivityStreak,
  AnalyticsError 
} from '../types/analytics';

// Basescan API configuration
const BASESCAN_API_URL = 'https://api.basescan.org/api';
// Support both Basescan and Etherscan API keys (Etherscan now supports Base)
const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || 
                process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 
                'YourApiKeyToken';

// Create a public client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export class AnalyticsService {
  private static instance: AnalyticsService;
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Validates if the provided string is a valid Ethereum address
   */
  validateAddress(address: string): boolean {
    return isAddress(address);
  }

  /**
   * Test method to debug Basescan API
   */
  async testBasescanAPI(address: string): Promise<any> {
    try {
      const checksumAddress = getAddress(address);
      console.log('🧪 Testing Basescan API...');
      
      // Test URL without API key first
      let testUrl = `${BASESCAN_API_URL}?module=account&action=balance&address=${checksumAddress}&tag=latest`;
      
      if (API_KEY !== 'YourApiKeyToken') {
        testUrl += `&apikey=${API_KEY}`;
      }
      
      console.log('🔗 Test URL:', testUrl.replace(API_KEY, 'KEY_HIDDEN'));
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      console.log('📋 Test response:', data);
      return data;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  }

  /**
   * Fetches transaction history using Basescan API
   */
  private async fetchTransactionHistory(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      console.log(`🔍 Fetching transaction history from Basescan for: ${checksumAddress}`);
      
      // First, let's test without API key to see if that works
      let normalTxUrl = `${BASESCAN_API_URL}?module=account&action=txlist&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`;
      
      // Add API key only if we have one
      if (API_KEY !== 'YourApiKeyToken') {
        normalTxUrl += `&apikey=${API_KEY}`;
        console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');
      } else {
        console.log('🔓 Testing without API key first...');
      }
      
      console.log('📡 Calling Basescan API...');
      console.log('🔗 URL:', normalTxUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
      const response = await fetch(normalTxUrl);
      
      if (!response.ok) {
        throw new Error(`Basescan API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📋 Basescan response:', {
        status: data.status,
        message: data.message,
        resultCount: data.result?.length || 0
      });

      const transactions: Transaction[] = [];

      // Process normal transactions
      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        console.log(`📊 Processing ${data.result.length} transactions...`);
        
        for (const tx of data.result) {
          transactions.push({
            hash: tx.hash,
            blockNumber: BigInt(tx.blockNumber),
            timestamp: parseInt(tx.timeStamp),
            from: tx.from,
            to: tx.to || null,
            value: BigInt(tx.value),
            gasUsed: BigInt(tx.gasUsed),
            gasPrice: BigInt(tx.gasPrice),
            status: tx.txreceipt_status === '1' ? 'success' : 'failed',
            isContractInteraction: tx.input !== '0x',
          });
        }
      } else {
        console.warn('⚠️ Basescan returned no results or error:', data.message);
        if (data.status === '0') {
          // Status 0 might mean no transactions (which is valid) or an error
          if (data.message === 'No transactions found') {
            console.log('✅ Address has no transactions (valid result)');
            return [];
          } else {
            throw new Error(`Basescan API error: ${data.message}`);
          }
        }
      }

      console.log(`✅ Basescan: Found ${transactions.length} total transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching from Basescan:', error);
      
      // Simple fallback using basic RPC
      console.log('🔄 Using basic RPC fallback...');
      return this.fetchBasicTransactions(address);
    }
  }

  /**
   * Simple fallback using basic RPC calls
   */
  private async fetchBasicTransactions(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      const currentBlock = await publicClient.getBlockNumber();
      const transactions: Transaction[] = [];
      
      console.log('🔄 Checking recent blocks for transactions...');
      
      // Check recent blocks as fallback
      for (let i = 0; i < 20; i++) {
        const blockNumber = currentBlock - BigInt(i);
        try {
          const block = await publicClient.getBlock({ 
            blockNumber, 
            includeTransactions: true 
          });
          
          if (block.transactions) {
            for (const tx of block.transactions) {
              if (typeof tx === 'object' && (tx.from === checksumAddress || tx.to === checksumAddress)) {
                transactions.push({
                  hash: tx.hash,
                  blockNumber: tx.blockNumber || blockNumber,
                  timestamp: Number(block.timestamp),
                  from: tx.from,
                  to: tx.to,
                  value: tx.value,
                  gasUsed: BigInt(0),
                  gasPrice: tx.gasPrice || BigInt(0),
                  status: 'success',
                  isContractInteraction: tx.to !== null && tx.input !== '0x',
                });
              }
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log(`🔄 Basic RPC: Found ${transactions.length} transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error in basic RPC method:', error);
      return [];
    }
  }

  /**
   * Gets the current ETH balance for an address
   */
  private async getBalance(address: string): Promise<bigint> {
    try {
      const balance = await publicClient.getBalance({ 
        address: getAddress(address) 
      });
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Calculates daily activity from transactions
   */
  private calculateDailyActivity(transactions: Transaction[]): DailyActivity[] {
    const dailyMap = new Map<string, DailyActivity>();
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          transactionCount: 0,
          totalValue: BigInt(0),
          gasSpent: BigInt(0),
          uniqueInteractions: 0,
        });
      }
      
      const daily = dailyMap.get(date)!;
      daily.transactionCount++;
      daily.totalValue += tx.value;
      daily.gasSpent += tx.gasUsed * tx.gasPrice;
    });
    
    return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Calculates monthly activity from daily activity
   */
  private calculateMonthlyActivity(dailyActivity: DailyActivity[]): MonthlyActivity[] {
    const monthlyMap = new Map<string, MonthlyActivity>();
    
    dailyActivity.forEach(daily => {
      const month = daily.date.substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          transactionCount: 0,
          totalValue: BigInt(0),
          gasSpent: BigInt(0),
          activeDays: 0,
          uniqueInteractions: 0,
        });
      }
      
      const monthly = monthlyMap.get(month)!;
      monthly.transactionCount += daily.transactionCount;
      monthly.totalValue += daily.totalValue;
      monthly.gasSpent += daily.gasSpent;
      monthly.activeDays++;
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  }

  /**
   * Calculates activity streaks
   */
  private calculateActivityStreak(dailyActivity: DailyActivity[]): ActivityStreak {
    if (dailyActivity.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakStart: null,
        streakEnd: null,
        isActive: false,
      };
    }

    const sortedDays = dailyActivity.sort((a, b) => a.date.localeCompare(b.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakStart: string | null = null;
    let _longestStreakStart: string | null = null;
    let _longestStreakEnd: string | null = null;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Calculate streaks
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        currentStreakStart = sortedDays[i].date;
      } else {
        const prevDate = new Date(sortedDays[i - 1].date);
        const currentDate = new Date(sortedDays[i].date);
        const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          _longestStreakStart = currentStreakStart;
          _longestStreakEnd = sortedDays[i - 1].date;
        }
          currentStreak = 1;
          currentStreakStart = sortedDays[i].date;
        }
      }
    }
    
    // Check final streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      _longestStreakStart = currentStreakStart;
      _longestStreakEnd = sortedDays[sortedDays.length - 1].date;
    }
    
    // Determine if current streak is active (last activity was today or yesterday)
    const lastActivityDate = sortedDays[sortedDays.length - 1].date;
    const isActive = lastActivityDate === today || lastActivityDate === yesterday;
    
    return {
      currentStreak: isActive ? currentStreak : 0,
      longestStreak,
      streakStart: isActive ? currentStreakStart : null,
      streakEnd: isActive ? lastActivityDate : null,
      isActive,
    };
  }

  /**
   * Main method to analyze an address and return comprehensive analytics
   */
  async analyzeAddress(address: string): Promise<AddressAnalytics> {
    if (!this.validateAddress(address)) {
      throw {
        message: 'Invalid Ethereum address',
        code: 'INVALID_ADDRESS',
      } as AnalyticsError;
    }

    try {
      const checksumAddress = getAddress(address);
      console.log(`🚀 Starting analysis for: ${checksumAddress}`);
      
      // Fetch data in parallel
      const [transactions, ethBalance] = await Promise.all([
        this.fetchTransactionHistory(checksumAddress),
        this.getBalance(checksumAddress),
      ]);

      console.log(`📊 Analysis data: ${transactions.length} transactions, ${AnalyticsService.formatEth(ethBalance)} ETH balance`);

      // Calculate analytics
      const dailyActivity = this.calculateDailyActivity(transactions);
      const monthlyActivity = this.calculateMonthlyActivity(dailyActivity);
      const activityStreak = this.calculateActivityStreak(dailyActivity);
      
      // Calculate aggregate metrics
      const uniqueAddresses = new Set<string>();
      let totalValue = BigInt(0);
      let totalGasSpent = BigInt(0);
      let contractInteractions = 0;
      
      transactions.forEach(tx => {
        if (tx.from === checksumAddress && tx.to) uniqueAddresses.add(tx.to);
        if (tx.to === checksumAddress) uniqueAddresses.add(tx.from);
        totalValue += tx.value;
        totalGasSpent += tx.gasUsed * tx.gasPrice;
        if (tx.isContractInteraction) contractInteractions++;
      });

      const firstTx = transactions[transactions.length - 1];
      const lastTx = transactions[0];

      const result = {
        address: checksumAddress,
        totalTransactions: transactions.length,
        firstTransactionDate: firstTx ? new Date(firstTx.timestamp * 1000).toISOString().split('T')[0] : null,
        lastTransactionDate: lastTx ? new Date(lastTx.timestamp * 1000).toISOString().split('T')[0] : null,
        totalValueTransferred: totalValue,
        totalGasSpent,
        averageGasPrice: transactions.length > 0 ? 
          transactions.reduce((sum, tx) => sum + tx.gasPrice, BigInt(0)) / BigInt(transactions.length) : BigInt(0),
        uniqueInteractedAddresses: uniqueAddresses.size,
        contractInteractions,
        activeDays: dailyActivity.length,
        activeMonths: monthlyActivity.length,
        activityStreak,
        dailyActivity,
        monthlyActivity,
        ethBalance,
        lastUpdated: Date.now(),
        analysisRange: {
          from: firstTx ? new Date(firstTx.timestamp * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
        },
      };

      console.log('✅ Analysis complete:', {
        transactions: result.totalTransactions,
        activeDays: result.activeDays,
        currentStreak: result.activityStreak.currentStreak
      });

      return result;
    } catch (error) {
      console.error('❌ Error analyzing address:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UNKNOWN',
      } as AnalyticsError;
    }
  }

  /**
   * Fetches transaction history using Basescan API
   */
  private async fetchTransactionHistoryBasescan(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      console.log(`🔍 Fetching from Basescan for: ${checksumAddress}`);
      
      // Fetch normal transactions first
      const normalTxUrl = `${BASESCAN_API_URL}?module=account&action=txlist&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${API_KEY}`;
      
      console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');
      
      console.log('📡 Calling Basescan...');
      const response = await fetch(normalTxUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📋 Basescan response:', {
        status: data.status,
        message: data.message,
        count: data.result?.length || 0
      });

      const transactions: Transaction[] = [];

      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        for (const tx of data.result) {
          transactions.push({
            hash: tx.hash,
            blockNumber: BigInt(tx.blockNumber),
            timestamp: parseInt(tx.timeStamp),
            from: tx.from,
            to: tx.to || null,
            value: BigInt(tx.value),
            gasUsed: BigInt(tx.gasUsed),
            gasPrice: BigInt(tx.gasPrice),
            status: tx.txreceipt_status === '1' ? 'success' : 'failed',
            isContractInteraction: tx.input !== '0x',
          });
        }
      } else if (data.status === '0') {
        if (data.message === 'No transactions found') {
          console.log('✅ No transactions found (valid result)');
          return [];
        } else if (data.message === 'NOTOK') {
          throw new Error('❌ API Key Error: Invalid or missing API key. Please check your NEXT_PUBLIC_ETHERSCAN_API_KEY or NEXT_PUBLIC_BASESCAN_API_KEY in .env.local');
        } else {
          throw new Error(`Basescan API error: ${data.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Unexpected Basescan response: ${JSON.stringify(data)}`);
      }

      console.log(`✅ Successfully processed ${transactions.length} transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Basescan fetch failed:', error);
      throw error;
    }
  }

  /**
   * Gets the current ETH balance for an address
   */
  private async getBalance(address: string): Promise<bigint> {
    try {
      const balance = await publicClient.getBalance({ 
        address: getAddress(address) 
      });
      console.log(`💰 Balance: ${AnalyticsService.formatEth(balance)} ETH`);
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Formats large numbers for display
   */
  static formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  }

  /**
   * Formats ETH amounts for display
   */
  static formatEth(wei: bigint, decimals: number = 4): string {
    return Number(formatEther(wei)).toFixed(decimals);
  }
}