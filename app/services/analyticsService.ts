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
   * Fetches comprehensive transaction history using Alchemy
   */
  private async fetchTransactionHistory(address: string): Promise<Transaction[]> {
    try {
      const checksumAddress = getAddress(address);
      const transactions: Transaction[] = [];
      
      // Fetch transfers (both sent and received)
      const [sentTxs, receivedTxs] = await Promise.all([
        alchemy.core.getAssetTransfers({
          fromAddress: checksumAddress,
          category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
          maxCount: 1000,
          order: 'desc'
        }),
        alchemy.core.getAssetTransfers({
          toAddress: checksumAddress,
          category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
          maxCount: 1000,
          order: 'desc'
        })
      ]);

      // Process sent transactions
      for (const transfer of sentTxs.transfers) {
        if (transfer.hash) {
          const receipt = await alchemy.core.getTransactionReceipt(transfer.hash);
          const tx = await alchemy.core.getTransaction(transfer.hash);
          
          transactions.push({
            hash: transfer.hash,
            blockNumber: BigInt(transfer.blockNum),
            timestamp: new Date(transfer.metadata.blockTimestamp).getTime() / 1000,
            from: transfer.from,
            to: transfer.to || null,
            value: BigInt(Math.floor((transfer.value || 0) * 1e18)),
            gasUsed: BigInt(receipt?.gasUsed?.toString() || '0'),
            gasPrice: BigInt(tx?.gasPrice?.toString() || '0'),
            status: receipt?.status === 1 ? 'success' : 'failed',
            isContractInteraction: transfer.category !== 'external',
          });
        }
      }

      // Process received transactions (avoid duplicates)
      const existingHashes = new Set(transactions.map(tx => tx.hash));
      for (const transfer of receivedTxs.transfers) {
        if (transfer.hash && !existingHashes.has(transfer.hash)) {
          const receipt = await alchemy.core.getTransactionReceipt(transfer.hash);
          const tx = await alchemy.core.getTransaction(transfer.hash);
          
          transactions.push({
            hash: transfer.hash,
            blockNumber: BigInt(transfer.blockNum),
            timestamp: new Date(transfer.metadata.blockTimestamp).getTime() / 1000,
            from: transfer.from,
            to: transfer.to || null,
            value: BigInt(Math.floor((transfer.value || 0) * 1e18)),
            gasUsed: BigInt(receipt?.gasUsed?.toString() || '0'),
            gasPrice: BigInt(tx?.gasPrice?.toString() || '0'),
            status: receipt?.status === 1 ? 'success' : 'failed',
            isContractInteraction: transfer.category !== 'external',
          });
        }
      }
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transaction history with Alchemy:', error);
      // Fallback to basic method if Alchemy fails
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