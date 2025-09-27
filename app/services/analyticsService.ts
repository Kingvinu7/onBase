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

// Etherscan v2 API supports Base network with chainid=8453
const ETHERSCAN_V2_API_URL = 'https://api.etherscan.io/v2/api';
const BASE_CHAIN_ID = '8453';
const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';

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
   * Test method to debug Etherscan v2 API for Base
   */
  async testEtherscanAPI(address: string): Promise<any> {
    try {
      const checksumAddress = getAddress(address);
      console.log('🧪 Testing Etherscan v2 API for Base...');
      
      // Test balance endpoint with Base chain ID
      let testUrl = `${ETHERSCAN_V2_API_URL}?chainid=${BASE_CHAIN_ID}&module=account&action=balance&address=${checksumAddress}&tag=latest`;
      
      if (API_KEY !== 'YourApiKeyToken') {
        testUrl += `&apikey=${API_KEY}`;
        console.log('🔑 Using Etherscan API key:', API_KEY.substring(0, 8) + '...');
      }
      
      console.log('🔗 Test URL:', testUrl.replace(API_KEY, 'KEY_HIDDEN'));
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      console.log('📋 Etherscan v2 response:', data);
      return data;
    } catch (error) {
      console.error('❌ Etherscan test failed:', error);
      return null;
    }
  }

  /**
   * Main transaction history fetching method
   */
  private async fetchTransactionHistory(address: string): Promise<Transaction[]> {
    // Check if we have an Etherscan API key
    if (API_KEY !== 'YourApiKeyToken') {
      try {
        console.log('🎯 Using Etherscan v2 API for Base network...');
        return await this.fetchTransactionHistoryEtherscan(address);
      } catch (etherscanError) {
        console.warn('⚠️ Etherscan v2 failed, using enhanced RPC...', etherscanError);
        return await this.fetchBasicTransactions(address);
      }
    } else {
      console.log('🎯 No API key found, using enhanced RPC method...');
      return await this.fetchBasicTransactions(address);
    }
  }

  /**
   * Fetches transaction history using Etherscan v2 API for Base
   */
  private async fetchTransactionHistoryEtherscan(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      console.log(`🔍 Fetching from Etherscan v2 for Base: ${checksumAddress}`);
      
      // Fetch normal transactions using Etherscan v2 API with Base chain ID
      const normalTxUrl = `${ETHERSCAN_V2_API_URL}?chainid=${BASE_CHAIN_ID}&module=account&action=txlist&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${API_KEY}`;
      
      console.log('📡 Calling Etherscan v2 API...');
      console.log('🔗 URL:', normalTxUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
      
      const response = await fetch(normalTxUrl);
      
      if (!response.ok) {
        throw new Error(`Etherscan v2 API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📋 Etherscan v2 response:', {
        status: data.status,
        message: data.message,
        resultCount: data.result?.length || 0
      });

      const transactions: Transaction[] = [];

      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        console.log(`📊 Processing ${data.result.length} transactions from Etherscan v2...`);
        
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
          throw new Error('❌ API Key Error: Please check your NEXT_PUBLIC_ETHERSCAN_API_KEY in .env.local');
        } else {
          throw new Error(`Etherscan v2 API error: ${data.message || 'Unknown error'}`);
        }
      }

      console.log(`✅ Etherscan v2: Found ${transactions.length} total transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching from Etherscan v2:', error);
      throw error;
    }
  }

  /**
   * Enhanced RPC method using Base network directly (no API key needed)
   */
  private async fetchBasicTransactions(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      const currentBlock = await publicClient.getBlockNumber();
      const transactions: Transaction[] = [];
      
      console.log(`🔄 Using Base RPC directly for: ${checksumAddress}`);
      console.log(`📊 Current block: ${currentBlock}, checking last 1000 blocks...`);
      
      // Check blocks in smaller batches for better performance
      const blocksToCheck = 1000;
      const batchSize = 50;
      
      for (let batch = 0; batch < blocksToCheck / batchSize; batch++) {
        const batchPromises = [];
        
        // Create batch of block requests
        for (let i = 0; i < batchSize; i++) {
          const blockNumber = currentBlock - BigInt(batch * batchSize + i);
          if (blockNumber > 0) {
            batchPromises.push(
              publicClient.getBlock({ 
                blockNumber, 
                includeTransactions: true 
              }).catch(() => null)
            );
          }
        }
        
        // Process batch
        const blocks = await Promise.allSettled(batchPromises);
        
        blocks.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value && result.value.transactions) {
            for (const tx of result.value.transactions) {
              if (typeof tx === 'object' && (tx.from === checksumAddress || tx.to === checksumAddress)) {
                transactions.push({
                  hash: tx.hash,
                  blockNumber: tx.blockNumber || (currentBlock - BigInt(batch * batchSize + index)),
                  timestamp: Number(result.value.timestamp),
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
        });
        
        // Log progress
        if (batch % 5 === 0) {
          console.log(`📈 Progress: ${batch * batchSize}/${blocksToCheck} blocks, ${transactions.length} transactions found`);
        }
        
        // Stop if we found enough transactions
        if (transactions.length >= 50) {
          console.log(`🎯 Found sufficient transactions (${transactions.length}), stopping search`);
          break;
        }
      }
      
      console.log(`✅ RPC: Found ${transactions.length} total transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error in RPC method:', error);
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
      console.log(`💰 Balance: ${AnalyticsService.formatEth(balance)} ETH`);
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
          }
          currentStreak = 1;
          currentStreakStart = sortedDays[i].date;
        }
      }
    }
    
    // Check final streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    
    // Determine if current streak is active
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
      
      // Check if we have an API key
      if (API_KEY !== 'YourApiKeyToken') {
        console.log('🔑 API key detected, will try Etherscan v2...');
      } else {
        console.log('🔓 No API key, will use RPC method...');
      }
      
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
   * Fetches transaction history using Etherscan v2 API for Base
   */
  private async fetchTransactionHistoryEtherscan(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      console.log(`🔍 Fetching from Etherscan v2 for Base: ${checksumAddress}`);
      
      // Fetch normal transactions using Etherscan v2 API with Base chain ID
      const normalTxUrl = `${ETHERSCAN_V2_API_URL}?chainid=${BASE_CHAIN_ID}&module=account&action=txlist&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${API_KEY}`;
      
      console.log('📡 Calling Etherscan v2 API...');
      console.log('🔗 URL:', normalTxUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
      
      const response = await fetch(normalTxUrl);
      
      if (!response.ok) {
        throw new Error(`Etherscan v2 API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📋 Etherscan v2 response:', {
        status: data.status,
        message: data.message,
        resultCount: data.result?.length || 0
      });

      const transactions: Transaction[] = [];

      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        console.log(`📊 Processing ${data.result.length} transactions from Etherscan v2...`);
        
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
          throw new Error('❌ API Key Error: Please check your NEXT_PUBLIC_ETHERSCAN_API_KEY in .env.local');
        } else {
          throw new Error(`Etherscan v2 API error: ${data.message || 'Unknown error'}`);
        }
      }

      console.log(`✅ Etherscan v2: Found ${transactions.length} total transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching from Etherscan v2:', error);
      throw error;
    }
  }

  /**
   * Enhanced RPC method using Base network directly
   */
  private async fetchBasicTransactions(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      const currentBlock = await publicClient.getBlockNumber();
      const transactions: Transaction[] = [];
      
      console.log(`🔄 Using Base RPC directly for: ${checksumAddress}`);
      console.log(`📊 Current block: ${currentBlock}, checking last 500 blocks...`);
      
      // Check recent blocks for transactions
      for (let i = 0; i < 500; i++) {
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
        
        // Log progress every 100 blocks
        if (i % 100 === 0 && i > 0) {
          console.log(`📈 Checked ${i} blocks, found ${transactions.length} transactions`);
        }
        
        // Stop if we found enough
        if (transactions.length >= 20) {
          console.log(`🎯 Found ${transactions.length} transactions, stopping search`);
          break;
        }
      }
      
      console.log(`✅ RPC: Found ${transactions.length} total transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error in RPC method:', error);
      return [];
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