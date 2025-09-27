# 🔗 Alchemy Setup Guide for Base Analytics

> **Updated**: Complete step-by-step guide for setting up Alchemy with Base network

## 📋 **Step-by-Step Alchemy Setup**

### **1. Create Alchemy Account & App**

1. **Visit**: [dashboard.alchemy.com](https://dashboard.alchemy.com)
2. **Sign up** or log in to your account
3. **Click**: "Create new app" button

### **2. Configure Your App**

When creating the app, make sure to select:

```
Name: Base Analytics App
Description: Analytics for Base blockchain addresses
Chain: Base (NOT Ethereum!)
Network: Base Mainnet
```

⚠️ **Important**: Select **Base**, not Ethereum. The methods are the same, but the network is different.

### **3. Get Your API Key**

After creating the app:
1. Click on your app name
2. Go to the **"API Key"** tab
3. Copy your **API Key** (starts with something like `alcht_xxx...`)

### **4. Add to Environment Variables**

Create or update your `.env.local` file:

```bash
# Alchemy API Key for Base network
NEXT_PUBLIC_ALCHEMY_API_KEY=alcht_your_actual_api_key_here

# OnchainKit API Key (separate)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key_here
```

## 🔧 **API Methods Available**

Yes, `eth_getBlockByNumber` is available, but our app uses higher-level Alchemy SDK methods:

### **Methods We Use:**

```typescript
// ✅ What our app uses (easier)
alchemy.core.getAssetTransfers({
  fromAddress: address,
  category: ['external', 'internal', 'erc20', 'erc721', 'erc1155']
});

alchemy.core.getBalance(address);
alchemy.core.getTransactionReceipt(hash);
```

### **Raw RPC Methods (if needed):**

```typescript
// ⚙️ Direct RPC calls (more complex but more control)
eth_getBlockByNumber
eth_getTransactionByHash
eth_getTransactionReceipt
eth_getBalance
eth_getLogs
alchemy_getAssetTransfers (Alchemy-specific)
```

## 🚀 **Testing Your Setup**

### **Method 1: Using SDK (Recommended)**

```typescript
import { Alchemy, Network } from 'alchemy-sdk';

const alchemy = new Alchemy({
  apiKey: 'your_api_key_here',
  network: Network.BASE_MAINNET, // Important: BASE_MAINNET not ETH_MAINNET
});

// Test with a known Base address
const testAddress = '0x4200000000000000000000000000000000000006'; // WETH on Base
const balance = await alchemy.core.getBalance(testAddress);
console.log('Balance:', balance);
```

### **Method 2: Direct RPC Call**

```typescript
const response = await fetch(`https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
    id: 1,
  }),
});

const data = await response.json();
console.log('Latest block:', data.result);
```

## 📊 **Base Network Details**

- **Chain ID**: 8453
- **RPC URL**: `https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- **Block Explorer**: [basescan.org](https://basescan.org)
- **Native Token**: ETH (same as Ethereum)

## 🔍 **Available Alchemy Methods for Base**

### **Core Methods:**
- `getBalance(address)` - Get ETH balance
- `getTransactionCount(address)` - Get nonce
- `getCode(address)` - Check if contract
- `getStorageAt(address, position)` - Read contract storage

### **Transaction Methods:**
- `getTransaction(hash)` - Get transaction details
- `getTransactionReceipt(hash)` - Get receipt with gas used
- `getAssetTransfers()` - Get all transfers (our main method)

### **Block Methods:**
- `getBlockNumber()` - Latest block number
- `getBlock(blockNumber)` - Block details
- `getBlockWithTransactions(blockNumber)` - Block + all transactions

### **Enhanced Methods (Alchemy-specific):**
- `getAssetTransfers()` - All token transfers
- `getTokenBalances(address)` - All token balances
- `getTokenMetadata(contractAddress)` - Token info
- `getNftsForOwner(address)` - NFT holdings

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Wrong Network Selected**
   ```
   Error: "Method not supported"
   Solution: Ensure you selected "Base" not "Ethereum"
   ```

2. **API Key Issues**
   ```
   Error: "Unauthorized" 
   Solution: Check your API key in .env.local
   ```

3. **Rate Limiting**
   ```
   Error: "Too many requests"
   Solution: Alchemy free tier has limits, consider upgrading
   ```

### **Rate Limits:**

- **Free Tier**: 300 requests/second
- **Growth Tier**: 660 requests/second  
- **Scale Tier**: 1,320 requests/second

## 🔄 **Migration from Other Providers**

If you're switching from another provider:

### **From Infura:**
```typescript
// Old Infura
const provider = new ethers.providers.JsonRpcProvider(
  `https://base-mainnet.infura.io/v3/${INFURA_KEY}`
);

// New Alchemy
const alchemy = new Alchemy({
  apiKey: ALCHEMY_KEY,
  network: Network.BASE_MAINNET,
});
```

### **From QuickNode:**
```typescript
// Old QuickNode  
const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_URL);

// New Alchemy
const alchemy = new Alchemy({
  apiKey: ALCHEMY_KEY,
  network: Network.BASE_MAINNET,
});
```

## 💡 **Pro Tips**

1. **Use SDK Methods**: Higher-level methods are easier and more reliable
2. **Cache Results**: Store results to reduce API calls
3. **Handle Errors**: Always have fallback strategies
4. **Monitor Usage**: Check your dashboard for usage stats
5. **Batch Requests**: Group multiple calls when possible

## 🎯 **Ready to Test**

Your Base Analytics app should now work with real Alchemy data! Try analyzing these Base addresses:

- **WETH Contract**: `0x4200000000000000000000000000000000000006`
- **Base Bridge**: `0x49048044D57e1C92A77f79988d21Fa8fAF74E97e`
- **Uniswap V3**: `0x2626664c2603336E57B271c5C0b26F421741e481`

🚀 **Your Base Analytics app is now powered by real Alchemy data!**