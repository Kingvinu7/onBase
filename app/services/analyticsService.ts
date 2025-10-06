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
import { API_CONFIG } from '../constants/config';
import { getApiConfig, logEnvironmentStatus } from '../utils/env';

// Get API configuration
const apiConfig = getApiConfig();

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
  async testEtherscanAPI(address: string): Promise<unknown> {
    try {
      const checksumAddress = getAddress(address);
      console.log('🧪 Testing Etherscan v2 API for Base...');
      
      // Log environment status for debugging
      logEnvironmentStatus();
      
      // Test balance endpoint with Base chain ID
      let testUrl = `${API_CONFIG.etherscan.baseUrl}?chainid=${API_CONFIG.etherscan.baseChainId}&module=account&action=balance&address=${checksumAddress}&tag=latest`;
      
      if (apiConfig.hasValidApiKey) {
        testUrl += `&apikey=${apiConfig.etherscanApiKey}`;
        console.log('🔑 Using Etherscan API key:', apiConfig.etherscanApiKey.substring(0, 8) + '...');
      }
      
      console.log('🔗 Test URL:', testUrl.replace(apiConfig.etherscanApiKey, 'KEY_HIDDEN'));
      
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
    // Check if we have a valid Etherscan API key
    if (apiConfig.hasValidApiKey) {
      try {
        console.log('🎯 Using Etherscan v2 API for COMPLETE Base history...');
        return await this.fetchTransactionHistoryEtherscan(address);
      } catch (etherscanError) {
        console.warn('⚠️ Etherscan v2 failed, using RPC fallback...', etherscanError);
        return await this.fetchBasicTransactions(address);
      }
    } else {
      console.log('🎯 No valid API key found, using RPC method...');
      return await this.fetchBasicTransactions(address);
    }
  }

  /**
   * Fetches transaction history using Etherscan v2 API with pagination
   */
  private async fetchTransactionHistoryEtherscan(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      console.log(`🔍 Fetching COMPLETE history from Etherscan v2 for Base: ${checksumAddress}`);
      
      const allTransactions: Transaction[] = [];
      let page = 1;
      
      // Fetch multiple pages to get complete history
      while (true) {
        const pageUrl = `${API_CONFIG.etherscan.baseUrl}?chainid=${API_CONFIG.etherscan.baseChainId}&module=account&action=txlist&address=${checksumAddress}&startblock=0&endblock=99999999&page=${page}&offset=${API_CONFIG.etherscan.maxOffset}&sort=asc&apikey=${apiConfig.etherscanApiKey}`;
        
        console.log(`📡 Fetching page ${page} from Etherscan v2...`);
        
        const response = await fetch(pageUrl);
        
        if (!response.ok) {
          throw new Error(`Etherscan v2 API failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log(`📋 Page ${page} response:`, {
          status: data.status,
          message: data.message,
          resultCount: data.result?.length || 0
        });

        if (data.status === '1' && data.result && Array.isArray(data.result)) {
          console.log(`📊 Processing ${data.result.length} transactions from page ${page}...`);
          
          for (const tx of data.result) {
            // Enhanced contract interaction detection
            const hasInput = tx.input && tx.input !== '0x';
            const isContractCreation = tx.to === null || tx.to === '';
            const highGasUsage = parseInt(tx.gasUsed) > 21000; // Simple transfers use exactly 21000 gas
            const isContract = hasInput || isContractCreation || highGasUsage;
            
            // Debug contract detection for first few transactions
            if (allTransactions.length < 3) {
              console.log(`🔍 Contract detection for tx ${tx.hash.slice(0, 10)}:`, {
                hasInput,
                isContractCreation,
                highGasUsage,
                gasUsed: tx.gasUsed,
                input: tx.input?.slice(0, 20) + '...',
                to: tx.to?.slice(0, 10),
                isContract
              });
            }
            
            allTransactions.push({
              hash: tx.hash,
              blockNumber: BigInt(tx.blockNumber),
              timestamp: parseInt(tx.timeStamp),
              from: tx.from,
              to: tx.to || null,
              value: BigInt(tx.value),
              gasUsed: BigInt(tx.gasUsed),
              gasPrice: BigInt(tx.gasPrice),
              status: tx.txreceipt_status === '1' ? 'success' : 'failed',
              isContractInteraction: isContract,
            });
          }
          
          // If we got less than maxOffset, we've reached the end
          if (data.result.length < API_CONFIG.etherscan.maxOffset) {
            console.log(`🏁 Reached end of transactions at page ${page}`);
            break;
          }
          
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > API_CONFIG.etherscan.maxPages) {
            console.log(`⚠️ Reached page limit (${API_CONFIG.etherscan.maxPages}), stopping. Total so far: ${allTransactions.length}`);
            break;
          }
          
        } else if (data.status === '0') {
          if (data.message === 'No transactions found' && page === 1) {
            console.log('✅ No transactions found (valid result)');
            break;
          } else if (data.message === 'NOTOK') {
            throw new Error('❌ API Key Error: Please check your NEXT_PUBLIC_ETHERSCAN_API_KEY in .env.local');
          } else {
            console.log(`⚠️ Page ${page} returned: ${data.message}`);
            break;
          }
        } else {
          console.log(`⚠️ Unexpected response on page ${page}:`, data);
          break;
        }
      }

      // Get first and last transaction dates for logging
      if (allTransactions.length > 0) {
        const sortedByTime = [...allTransactions].sort((a, b) => a.timestamp - b.timestamp);
        const firstTx = sortedByTime[0];
        const lastTx = sortedByTime[sortedByTime.length - 1];
        
        if (firstTx && lastTx) {
          console.log(`📅 COMPLETE Transaction range: ${new Date(firstTx.timestamp * 1000).toLocaleDateString()} to ${new Date(lastTx.timestamp * 1000).toLocaleDateString()}`);
        }
      }

      console.log(`✅ Etherscan v2 COMPLETE: Found ${allTransactions.length} total transactions across ${page} pages`);
      return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching complete history from Etherscan v2:', error);
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
      for (let i = 0; i < API_CONFIG.rpc.maxBlocksToCheck; i++) {
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
        } catch {
          continue;
        }
        
        // Log progress every 100 blocks
        if (i % 100 === 0 && i > 0) {
          console.log(`📈 Checked ${i} blocks, found ${transactions.length} transactions`);
        }
        
        // Stop if we found enough
        if (transactions.length >= API_CONFIG.rpc.minTransactionsToStop) {
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
      
      if (date && !dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          transactionCount: 0,
          totalValue: BigInt(0),
          gasSpent: BigInt(0),
          uniqueInteractions: 0,
        });
      }
      
      if (date) {
        const daily = dailyMap.get(date);
        if (daily) {
          daily.transactionCount++;
          daily.totalValue += tx.value;
          daily.gasSpent += tx.gasUsed * tx.gasPrice;
        }
      }
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
      console.log(`🚀 Starting COMPLETE analysis for: ${checksumAddress}`);
      
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
        // Add both from and to addresses to unique interactions
        if (tx.from && tx.from !== checksumAddress) uniqueAddresses.add(tx.from);
        if (tx.to && tx.to !== checksumAddress) uniqueAddresses.add(tx.to);
        
        totalValue += tx.value;
        totalGasSpent += tx.gasUsed * tx.gasPrice;
        if (tx.isContractInteraction) contractInteractions++;
      });

      console.log('📊 Metrics calculation:', {
        totalTx: transactions.length,
        uniqueAddresses: uniqueAddresses.size,
        contractInteractions,
        sampleTx: transactions.slice(0, 3).map(tx => ({
          hash: tx.hash.slice(0, 10),
          isContract: tx.isContractInteraction,
          to: tx.to?.slice(0, 10),
          hasInput: 'input data available'
        }))
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

      console.log('✅ COMPLETE Analysis:', {
        transactions: result.totalTransactions,
        activeDays: result.activeDays,
        activeMonths: result.activeMonths,
        firstTx: result.firstTransactionDate,
        lastTx: result.lastTransactionDate,
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