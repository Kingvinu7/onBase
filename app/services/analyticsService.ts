import { createPublicClient, http, isAddress, formatEther, getAddress } from 'viem';
import { base } from 'viem/chains';
import { Alchemy, Network } from 'alchemy-sdk';
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
const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || 'YourApiKeyToken';

// Create a public client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Initialize Alchemy SDK for Base network
const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo',
  network: Network.BASE_MAINNET,
});

// Alternative: Direct RPC calls if needed
const alchemyRpc = {
  url: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  
  async getBlockByNumber(blockNumber: string) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [blockNumber, true],
        id: 1,
      }),
    });
    return response.json();
  }
};

export class AnalyticsService {
  private static instance: AnalyticsService;
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Helper function to safely extract timestamp from transfer
   */
  private getTransferTimestamp(transfer: any): number {
    // Try to get timestamp from metadata first
    if (transfer.metadata?.blockTimestamp) {
      return new Date(transfer.metadata.blockTimestamp).getTime() / 1000;
    }
    
    // Fallback to current time if metadata is missing
    console.warn(`Missing blockTimestamp for transfer ${transfer.hash}, using current time`);
    return Date.now() / 1000;
  }

  /**
   * Validates if the provided string is a valid Ethereum address
   */
  validateAddress(address: string): boolean {
    return isAddress(address);
  }

  /**
   * Fetches transaction history using Basescan API
   */
  private async fetchTransactionHistoryBasescan(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      console.log(`🔍 Fetching transaction history from Basescan for: ${checksumAddress}`);
      
      // Fetch normal transactions
      const normalTxUrl = `${BASESCAN_API_URL}?module=account&action=txlist&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=1000&sort=desc&apikey=${BASESCAN_API_KEY}`;
      
      // Fetch internal transactions
      const internalTxUrl = `${BASESCAN_API_URL}?module=account&action=txlistinternal&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=1000&sort=desc&apikey=${BASESCAN_API_KEY}`;
      
      // Fetch ERC20 token transfers
      const erc20TxUrl = `${BASESCAN_API_URL}?module=account&action=tokentx&address=${checksumAddress}&startblock=0&endblock=99999999&page=1&offset=1000&sort=desc&apikey=${BASESCAN_API_KEY}`;

      const [normalResponse, internalResponse, erc20Response] = await Promise.all([
        fetch(normalTxUrl),
        fetch(internalTxUrl),
        fetch(erc20TxUrl)
      ]);

      const [normalData, internalData, erc20Data] = await Promise.all([
        normalResponse.json(),
        internalResponse.json(),
        erc20Response.json()
      ]);

      console.log(`📊 Basescan data:`, {
        normal: normalData.result?.length || 0,
        internal: internalData.result?.length || 0,
        erc20: erc20Data.result?.length || 0
      });

      const transactions: Transaction[] = [];

      // Process normal transactions
      if (normalData.status === '1' && normalData.result) {
        for (const tx of normalData.result) {
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
      }

      // Process internal transactions
      if (internalData.status === '1' && internalData.result) {
        for (const tx of internalData.result) {
          // Avoid duplicates
          if (!transactions.find(t => t.hash === tx.hash)) {
            transactions.push({
              hash: tx.hash,
              blockNumber: BigInt(tx.blockNumber),
              timestamp: parseInt(tx.timeStamp),
              from: tx.from,
              to: tx.to || null,
              value: BigInt(tx.value),
              gasUsed: BigInt(tx.gasUsed || '0'),
              gasPrice: BigInt('0'), // Internal txs don't have gas price
              status: 'success',
              isContractInteraction: true,
            });
          }
        }
      }

      // Process ERC20 token transfers (add as separate transactions)
      if (erc20Data.status === '1' && erc20Data.result) {
        for (const tx of erc20Data.result) {
          // Only add if not already present
          if (!transactions.find(t => t.hash === tx.hash)) {
            transactions.push({
              hash: tx.hash,
              blockNumber: BigInt(tx.blockNumber),
              timestamp: parseInt(tx.timeStamp),
              from: tx.from,
              to: tx.to || null,
              value: BigInt(0), // ERC20 transfers don't affect ETH balance
              gasUsed: BigInt(tx.gasUsed || '0'),
              gasPrice: BigInt(tx.gasPrice || '0'),
              status: 'success',
              isContractInteraction: true,
            });
          }
        }
      }

      console.log(`✅ Basescan: Found ${transactions.length} total transactions`);
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Error fetching from Basescan:', error);
      throw error;
    }
  }

  /**
   * Simple test method to check if Alchemy is working
   */
  async testAlchemyConnection(address: string): Promise<any> {
    try {
      console.log('🧪 Testing Alchemy connection...');
      const checksumAddress = getAddress(address);
      
      // Simple test - just get transfers without processing
      const transfers = await alchemy.core.getAssetTransfers({
        fromAddress: checksumAddress,
        category: ['external'],
        maxCount: 10,
        order: 'desc'
      });
      
      console.log('✅ Alchemy test successful:', transfers);
      return transfers;
    } catch (error) {
      console.error('❌ Alchemy test failed:', error);
      throw error;
    }
  }

  /**
   * Fetches comprehensive transaction history using Alchemy
   */
  private async fetchTransactionHistory(address: string): Promise<Transaction[]> {
    try {
      // Try Basescan first (more reliable for Base network)
      console.log('🎯 Using Basescan as primary data source...');
      return await this.fetchTransactionHistoryBasescan(address);
    } catch (basescanError) {
      console.warn('⚠️ Basescan failed, trying Alchemy...', basescanError);
      
      try {
        return await this.fetchTransactionHistoryAlchemy(address);
      } catch (alchemyError) {
        console.warn('⚠️ Alchemy failed, using basic RPC...', alchemyError);
        return await this.fetchTransactionHistoryFallback(address);
      }
    }
  }

  /**
   * Alternative method using direct Alchemy RPC calls
   */
  private async fetchTransactionHistoryRPC(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      const transactions: Transaction[] = [];

      // Get recent blocks using eth_getBlockByNumber
      const latestBlockResponse = await fetch(alchemyRpc.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });
      
      const latestBlockData = await latestBlockResponse.json();
      const latestBlock = parseInt(latestBlockData.result, 16);

      // Check last 100 blocks for transactions
      for (let i = 0; i < 100; i++) {
        const blockNumber = `0x${(latestBlock - i).toString(16)}`;
        
        const blockResponse = await fetch(alchemyRpc.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [blockNumber, true],
            id: 1,
          }),
        });

        const blockData = await blockResponse.json();
        if (blockData.result?.transactions) {
          for (const tx of blockData.result.transactions) {
            if (tx.from === checksumAddress || tx.to === checksumAddress) {
              transactions.push({
                hash: tx.hash,
                blockNumber: BigInt(parseInt(tx.blockNumber, 16)),
                timestamp: parseInt(blockData.result.timestamp, 16),
                from: tx.from,
                to: tx.to,
                value: BigInt(tx.value),
                gasUsed: BigInt(parseInt(tx.gas, 16)),
                gasPrice: BigInt(parseInt(tx.gasPrice || '0x0', 16)),
                status: 'success',
                isContractInteraction: tx.to !== null && tx.input !== '0x',
              });
            }
          }
        }
      }

      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching with RPC calls:', error);
      return this.fetchTransactionHistoryFallback(address);
    }
  }

  /**
   * Fallback method using basic RPC calls
   */
  private async fetchTransactionHistoryFallback(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      const currentBlock = await publicClient.getBlockNumber();
      const transactions: Transaction[] = [];
      
      // Check recent blocks as fallback
      for (let i = 0; i < 50; i++) {
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
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error in fallback method:', error);
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
      
      // Fetch data in parallel
      const [transactions, ethBalance] = await Promise.all([
        this.fetchTransactionHistory(checksumAddress),
        this.getBalance(checksumAddress),
      ]);

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

      return {
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
    } catch (error) {
      console.error('Error analyzing address:', error);
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