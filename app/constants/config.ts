/**
 * Application configuration constants
 */

export const APP_CONFIG = {
  name: 'onBase',
  description: 'Discover comprehensive insights about any Base address including transaction history, activity patterns, streaks, and more.',
  version: '1.0.0',
  url: 'https://onbase-six.vercel.app',
} as const;

export const API_CONFIG = {
  etherscan: {
    baseUrl: 'https://api.etherscan.io/v2/api',
    baseChainId: '8453',
    maxRetries: 3,
    retryDelay: 1000,
    maxPages: 50,
    maxOffset: 10000,
  },
  rpc: {
    maxBlocksToCheck: 500,
    minTransactionsToStop: 20,
  },
} as const;

export const UI_CONFIG = {
  loading: {
    skeletonCount: 8,
    debounceMs: 300,
  },
  analytics: {
    maxDecimals: 4,
    numberFormatThresholds: {
      billion: 1e9,
      million: 1e6,
      thousand: 1e3,
    },
  },
  address: {
    displayLength: 6,
    maxLength: 42,
  },
} as const;

export const ADDRESS_PROFILES = {
  whaleTrader: {
    minEth: 100,
    minDailyTxs: 10,
    icon: '🐋',
    name: 'Whale Trader',
  },
  defiPowerUser: {
    minContractRatio: 0.8,
    minTransactions: 100,
    icon: '🚀',
    name: 'DeFi Power User',
  },
  tradingBot: {
    minDailyTxs: 20,
    minContractRatio: 0.9,
    icon: '🤖',
    name: 'Trading Bot',
  },
  nftCollector: {
    minContractRatio: 0.6,
    maxEth: 10,
    icon: '🎨',
    name: 'NFT Collector',
  },
  activeTrader: {
    minTransactions: 200,
    minActiveDays: 30,
    icon: '📈',
    name: 'Active Trader',
  },
  contractDeployer: {
    minContractRatio: 0.5,
    maxTransactions: 50,
    icon: '⚙️',
    name: 'Contract Deployer',
  },
  regularUser: {
    minTransactions: 50,
    icon: '👤',
    name: 'Regular User',
  },
  newUser: {
    maxTransactions: 10,
    icon: '🌱',
    name: 'New User',
  },
  default: {
    icon: '📊',
    name: 'Base User',
  },
} as const;

export const TEST_ADDRESSES = [
  '0x4200000000000000000000000000000000000006', // WETH
  '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // Active wallet
  '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e', // Base Bridge
] as const;