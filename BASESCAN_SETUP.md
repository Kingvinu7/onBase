# 🔍 Basescan Setup Guide

Basescan provides the most accurate and comprehensive data for Base network transactions. Here's how to set it up:

## 🚀 **Quick Setup (Recommended)**

### **1. Get Basescan API Key**
1. Visit [basescan.org/apis](https://basescan.org/apis)
2. Click "Get a Free API Key Today!"
3. Sign up with email
4. Verify email and log in
5. Go to "API-KEYs" tab
6. Copy your API key

### **2. Add to Environment**
Add to your `.env.local` file:
```bash
# Basescan API Key (Primary data source)
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_api_key_here

# Keep Alchemy as fallback
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### **3. Test the Setup**
1. Restart your dev server: `npm run dev`
2. Try analyzing a Base address
3. Check browser console for: `🎯 Using Basescan as primary data source...`

## 📊 **What Basescan Provides**

### **✅ Accurate Data:**
- **Normal transactions**: All ETH transfers
- **Internal transactions**: Contract-to-contract transfers  
- **ERC20 token transfers**: All token movements
- **Real gas usage**: Actual gas used and gas prices
- **Transaction status**: Success/failed status
- **Complete history**: All transactions since address creation

### **🔗 API Endpoints Used:**
```
Normal Transactions:
https://api.basescan.org/api?module=account&action=txlist&address={address}

Internal Transactions:  
https://api.basescan.org/api?module=account&action=txlistinternal&address={address}

ERC20 Transfers:
https://api.basescan.org/api?module=account&action=tokentx&address={address}
```

## 🎯 **Benefits Over Alchemy**

| Feature | Basescan | Alchemy |
|---------|----------|---------|
| **Accuracy** | ✅ 100% accurate | ⚠️ Some data issues |
| **Complete History** | ✅ All transactions | ❌ Limited recent |
| **Internal Transactions** | ✅ Full support | ❌ Not supported on Base |
| **Gas Data** | ✅ Real gas used/price | ⚠️ Estimated |
| **Transaction Status** | ✅ Real success/fail | ⚠️ Assumed success |
| **Rate Limits** | ✅ 5 calls/sec free | ✅ Higher limits |

## 🔧 **Fallback Strategy**

The app now uses this priority order:
1. **🥇 Basescan** (Primary - most accurate)
2. **🥈 Alchemy** (Fallback - if Basescan fails)  
3. **🥉 Basic RPC** (Last resort - minimal data)

## 🆘 **Troubleshooting**

### **Common Issues:**

**"Invalid API Key"**
- Check your API key is correct in `.env.local`
- Make sure you're using the Basescan key (not Etherscan)

**"Rate Limited"**  
- Free tier: 5 calls/second
- Upgrade for higher limits if needed

**"No results"**
- Address might have no transactions
- Try a known active address first

### **Test Addresses:**
```
WETH Contract: 0x4200000000000000000000000000000000000006
Base Bridge: 0x49048044D57e1C92A77f79988d21Fa8fAF74E97e  
Active Wallet: 0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22
```

## 🚀 **Expected Results**

With Basescan, you should see:
- ✅ **Real transaction counts** (not zeros)
- ✅ **Accurate gas usage** and prices
- ✅ **Proper activity streaks** 
- ✅ **Complete transaction history**
- ✅ **Internal transactions** included
- ✅ **Token transfers** tracked

## 💡 **Pro Tips**

1. **Free API Key**: No credit card required for basic usage
2. **Rate Limits**: 5 calls/sec free, 100 calls/sec paid
3. **Multiple Endpoints**: We fetch normal, internal, and token transfers
4. **Caching**: Consider caching results to reduce API calls
5. **Monitoring**: Check API usage in Basescan dashboard

🎯 **Basescan will give you the most accurate Base analytics data!**