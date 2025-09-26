export interface Transaction {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  from: string;
  to: string | null;
  value: bigint;
  gasUsed: bigint;
  gasPrice: bigint;
  status: 'success' | 'failed';
  methodId?: string;
  isContractInteraction: boolean;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  transactionCount: number;
  totalValue: bigint;
  gasSpent: bigint;
  uniqueInteractions: number;
}

export interface MonthlyActivity {
  month: string; // YYYY-MM format
  transactionCount: number;
  totalValue: bigint;
  gasSpent: bigint;
  activeDays: number;
  uniqueInteractions: number;
}

export interface ActivityStreak {
  currentStreak: number;
  longestStreak: number;
  streakStart: string | null;
  streakEnd: string | null;
  isActive: boolean;
}

export interface AddressAnalytics {
  address: string;
  totalTransactions: number;
  firstTransactionDate: string | null;
  lastTransactionDate: string | null;
  totalValueTransferred: bigint;
  totalGasSpent: bigint;
  averageGasPrice: bigint;
  uniqueInteractedAddresses: number;
  contractInteractions: number;
  
  // Activity metrics
  activeDays: number;
  activeMonths: number;
  activityStreak: ActivityStreak;
  
  // Time-based breakdowns
  dailyActivity: DailyActivity[];
  monthlyActivity: MonthlyActivity[];
  
  // Current balances
  ethBalance: bigint;
  
  // Analysis timestamps
  lastUpdated: number;
  analysisRange: {
    from: string;
    to: string;
  };
}

export interface AnalyticsError {
  message: string;
  code: 'INVALID_ADDRESS' | 'NETWORK_ERROR' | 'RATE_LIMITED' | 'NO_DATA' | 'UNKNOWN';
}

export interface AnalyticsState {
  data: AddressAnalytics | null;
  loading: boolean;
  error: AnalyticsError | null;
}