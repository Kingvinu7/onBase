# 🔗 Real Data Sources for Base Analytics

This guide shows you how to integrate various blockchain data providers to fetch real, comprehensive data for your Base Analytics app.

## 🚀 **Current Implementation: Alchemy (Recommended)**

### **Setup Alchemy**

1. **Get API Key**: Sign up at [Alchemy.com](https://www.alchemy.com/)
2. **Create Base App**: Select "Base Mainnet" network
3. **Add to Environment**: 
   ```bash
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

### **Features Included:**
- ✅ Complete transaction history (up to 1000 recent)
- ✅ All transfer types (ETH, ERC20, ERC721, ERC1155)
- ✅ Real gas usage and transaction status
- ✅ Internal transactions
- ✅ Contract interactions detection
- ✅ Automatic fallback to basic RPC

## 🔄 **Alternative Data Sources**

### **1. Moralis**

```bash
npm install moralis @moralisweb3/common-evm-utils
```

```typescript
// Add to analyticsService.ts
import Moralis from 'moralis';

// Initialize Moralis
if (!Moralis.Core.isStarted) {
  await Moralis.start({
    apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
  });
}

// Fetch transactions
const transactions = await Moralis.EvmApi.transaction.getWalletTransactions({
  chain: "0x2105", // Base chain ID
  address: checksumAddress,
  limit: 100,
});
```

### **2. The Graph Protocol**

```bash
npm install @apollo/client graphql
```

```typescript
// Create GraphQL client for Base subgraphs
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/your-subgraph',
  cache: new InMemoryCache(),
});

// Query transactions
const GET_TRANSACTIONS = gql`
  query GetTransactions($address: String!) {
    transactions(where: { from: $address }) {
      id
      hash
      blockNumber
      timestamp
      value
      gasUsed
      gasPrice
    }
  }
`;
```

### **3. Etherscan-like APIs (Basescan)**

```typescript
// Using Basescan API
const BASESCAN_API = 'https://api.basescan.org/api';

async function fetchTransactionsFromBasescan(address: string) {
  const response = await fetch(
    `${BASESCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.BASESCAN_API_KEY}`
  );
  const data = await response.json();
  return data.result;
}
```

### **4. QuickNode**

```bash
npm install @quicknode/sdk
```

```typescript
import { QuickNode } from '@quicknode/sdk';

const qn = new QuickNode({
  endpointUrl: process.env.QUICKNODE_ENDPOINT_URL,
});

// Fetch transaction history
const txHistory = await qn.core.getTransactionsByAddress({
  address: checksumAddress,
  page: 1,
  perPage: 100,
});
```

## 🔧 **Enhanced Analytics Features**

### **Token Holdings & DeFi Positions**

```typescript
// Add to your analytics service
async getTokenHoldings(address: string) {
  const balances = await alchemy.core.getTokenBalances(address);
  
  const tokenData = await Promise.all(
    balances.tokenBalances.map(async (token) => {
      const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
      return {
        address: token.contractAddress,
        balance: token.tokenBalance,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
      };
    })
  );
  
  return tokenData;
}

async getDeFiPositions(address: string) {
  // Use protocols like DefiLlama API, Zapper API, or 1inch API
  const response = await fetch(
    `https://api.llama.fi/protocol/base-ecosystem`
  );
  return response.json();
}
```

### **NFT Analysis**

```typescript
async getNFTHoldings(address: string) {
  const nfts = await alchemy.nft.getNftsForOwner(address);
  
  return {
    totalNFTs: nfts.totalCount,
    ownedNfts: nfts.ownedNfts.map(nft => ({
      contractAddress: nft.contract.address,
      tokenId: nft.tokenId,
      name: nft.title,
      image: nft.media[0]?.gateway,
      collection: nft.contract.name,
    })),
  };
}
```

### **Advanced Metrics**

```typescript
// Add to your analytics types
interface EnhancedAnalytics extends AddressAnalytics {
  tokenHoldings: TokenHolding[];
  nftHoldings: NFTHolding[];
  defiPositions: DeFiPosition[];
  contractsDeployed: number;
  averageTransactionValue: bigint;
  mostActiveHours: number[];
  topInteractedContracts: string[];
  profitLoss: {
    realized: bigint;
    unrealized: bigint;
  };
}
```

## 📊 **Rate Limiting & Optimization**

### **Caching Strategy**

```typescript
// Add Redis or in-memory caching
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

async analyzeAddressWithCache(address: string) {
  const cacheKey = `analytics_${address}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached as AddressAnalytics;
  }
  
  const analytics = await this.analyzeAddress(address);
  cache.set(cacheKey, analytics);
  
  return analytics;
}
```

### **Batch Processing**

```typescript
// Process multiple addresses efficiently
async analyzeMultipleAddresses(addresses: string[]) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(addr => this.analyzeAddress(addr))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

## 🚀 **Deployment Considerations**

### **Environment Variables**

```bash
# Primary data source
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# Backup sources
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_key
NEXT_PUBLIC_QUICKNODE_URL=your_quicknode_url
BASESCAN_API_KEY=your_basescan_key

# Caching
REDIS_URL=your_redis_url
```

### **Error Handling & Fallbacks**

The current implementation includes:
1. **Primary**: Alchemy API with full features
2. **Fallback**: Basic RPC calls for essential data
3. **Error Recovery**: Graceful degradation of features
4. **Rate Limiting**: Built-in retry logic

## 🎯 **Getting Started**

1. **Choose Your Provider**: Alchemy (recommended) or alternatives
2. **Get API Keys**: Sign up and get your keys
3. **Update Environment**: Add keys to `.env.local`
4. **Install Dependencies**: `npm install alchemy-sdk`
5. **Test**: Try analyzing a known active address

## 💡 **Pro Tips**

- **Start with Alchemy**: Best balance of features and ease of use
- **Use Multiple Sources**: Combine providers for comprehensive data
- **Implement Caching**: Reduce API calls and improve performance  
- **Monitor Costs**: Track API usage and optimize queries
- **Handle Errors**: Always have fallback strategies

Your Base Analytics app now supports real, comprehensive blockchain data! 🎉