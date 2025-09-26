import type { AddressAnalytics } from '../types/analytics';

export const mockAnalyticsData: AddressAnalytics = {
  address: '0x742d35Cc6635C0532925a3b8D42D8A7A5B4c5b0E',
  totalTransactions: 1247,
  firstTransactionDate: '2023-08-15',
  lastTransactionDate: '2024-09-25',
  totalValueTransferred: BigInt('15750000000000000000'), // 15.75 ETH in wei
  totalGasSpent: BigInt('125000000000000000'), // 0.125 ETH in wei
  averageGasPrice: BigInt('20000000000'), // 20 gwei
  uniqueInteractedAddresses: 87,
  contractInteractions: 423,
  activeDays: 156,
  activeMonths: 12,
  activityStreak: {
    currentStreak: 7,
    longestStreak: 23,
    streakStart: '2024-09-19',
    streakEnd: '2024-09-25',
    isActive: true,
  },
  dailyActivity: [
    {
      date: '2024-09-25',
      transactionCount: 8,
      totalValue: BigInt('2500000000000000000'), // 2.5 ETH
      gasSpent: BigInt('15000000000000000'), // 0.015 ETH
      uniqueInteractions: 3,
    },
    {
      date: '2024-09-24',
      transactionCount: 12,
      totalValue: BigInt('1200000000000000000'), // 1.2 ETH
      gasSpent: BigInt('18000000000000000'), // 0.018 ETH
      uniqueInteractions: 5,
    },
    {
      date: '2024-09-23',
      transactionCount: 5,
      totalValue: BigInt('750000000000000000'), // 0.75 ETH
      gasSpent: BigInt('8000000000000000'), // 0.008 ETH
      uniqueInteractions: 2,
    },
    {
      date: '2024-09-22',
      transactionCount: 15,
      totalValue: BigInt('3100000000000000000'), // 3.1 ETH
      gasSpent: BigInt('25000000000000000'), // 0.025 ETH
      uniqueInteractions: 7,
    },
    {
      date: '2024-09-21',
      transactionCount: 3,
      totalValue: BigInt('500000000000000000'), // 0.5 ETH
      gasSpent: BigInt('6000000000000000'), // 0.006 ETH
      uniqueInteractions: 1,
    },
  ],
  monthlyActivity: [
    {
      month: '2024-09',
      transactionCount: 156,
      totalValue: BigInt('12500000000000000000'), // 12.5 ETH
      gasSpent: BigInt('85000000000000000'), // 0.085 ETH
      activeDays: 18,
      uniqueInteractions: 45,
    },
    {
      month: '2024-08',
      transactionCount: 234,
      totalValue: BigInt('8750000000000000000'), // 8.75 ETH
      gasSpent: BigInt('120000000000000000'), // 0.12 ETH
      activeDays: 22,
      uniqueInteractions: 62,
    },
    {
      month: '2024-07',
      transactionCount: 187,
      totalValue: BigInt('6200000000000000000'), // 6.2 ETH
      gasSpent: BigInt('95000000000000000'), // 0.095 ETH
      activeDays: 19,
      uniqueInteractions: 38,
    },
    {
      month: '2024-06',
      transactionCount: 145,
      totalValue: BigInt('4300000000000000000'), // 4.3 ETH
      gasSpent: BigInt('78000000000000000'), // 0.078 ETH
      activeDays: 16,
      uniqueInteractions: 29,
    },
  ],
  ethBalance: BigInt('5250000000000000000'), // 5.25 ETH in wei
  lastUpdated: Date.now(),
  analysisRange: {
    from: '2023-08-15',
    to: '2024-09-25',
  },
};