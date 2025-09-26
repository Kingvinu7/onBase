# Base Analytics

A comprehensive analytics platform for Base blockchain addresses built with Next.js and OnchainKit. Discover insights about any Base address including transaction history, activity patterns, streaks, and more.

![Base Analytics](https://img.shields.io/badge/Base-Analytics-blue) ![Next.js](https://img.shields.io/badge/Next.js-15.3-black) ![OnchainKit](https://img.shields.io/badge/OnchainKit-latest-orange)

## ✨ Features

- **📊 Comprehensive Analytics**: Transaction count, volume, gas usage, and more
- **🔥 Activity Streaks**: Track daily activity streaks and consistency
- **📈 Time-based Analysis**: Daily and monthly activity breakdowns
- **🤝 Network Insights**: Unique interactions and contract usage patterns
- **💰 Balance Tracking**: Current ETH balance and historical transfers
- **🎨 Modern UI**: Beautiful, responsive design with loading states
- **📱 Mobile Optimized**: Works seamlessly on all device sizes
- **⚡ Fast Performance**: Optimized for speed with caching and parallel requests

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OnchainKit API key from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd base-analytics
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OnchainKit API key:
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

1. **Enter an Address**: Input any Base blockchain address in the search field
2. **View Demo**: Click "View Demo Analytics" to see sample data
3. **Explore Metrics**: Browse through comprehensive analytics including:
   - Total transactions and ETH balance
   - Activity streaks and patterns
   - Monthly/daily activity breakdowns
   - Gas usage and network interactions
   - Contract interaction statistics

## 🏗️ Architecture

### Core Components

- **`AnalyticsService`**: Handles blockchain data fetching and processing
- **`AddressInput`**: User input component with validation
- **`AnalyticsDashboard`**: Main analytics display component
- **`MetricCard`**: Reusable metric display component

### Key Features

- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with user-friendly messages
- **Loading States**: Smooth loading experiences with skeleton UI
- **Responsive Design**: Mobile-first approach with modern CSS Grid/Flexbox

### Data Sources

Currently uses Base network's public RPC for demonstration. In production, consider:
- [Alchemy](https://www.alchemy.com/) for enhanced API limits
- [Moralis](https://moralis.io/) for comprehensive blockchain data
- [The Graph](https://thegraph.com/) for indexed blockchain data

## 🛠️ Development

### Project Structure

```
app/
├── components/           # React components
│   ├── AddressInput.tsx
│   ├── AnalyticsDashboard.tsx
│   └── MetricCard.tsx
├── services/            # Business logic
│   └── analyticsService.ts
├── types/               # TypeScript definitions
│   └── analytics.ts
├── utils/               # Utility functions
│   └── mockData.ts
└── page.tsx            # Main page component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Metrics

1. Update types in `app/types/analytics.ts`
2. Implement calculation logic in `AnalyticsService`
3. Add UI components in `AnalyticsDashboard`
4. Update mock data for testing

## 🎨 Customization

### Styling

The app uses CSS Modules with a modern dark theme. Key design tokens:

- **Colors**: Gradient backgrounds with glass morphism effects
- **Typography**: Inter font family with Source Code Pro for monospace
- **Animations**: Smooth transitions and hover effects
- **Layout**: CSS Grid and Flexbox for responsive design

### Themes

To customize the theme, modify CSS custom properties in `app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  /* Add your custom colors */
}
```

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Your OnchainKit API key
- `NEXT_PUBLIC_URL`: Custom deployment URL (optional)

### MiniKit Configuration

Update `minikit.config.ts` to customize the mini-app metadata:

```typescript
export const minikitConfig = {
  miniapp: {
    name: "Your App Name",
    description: "Your app description",
    // ... other config
  },
};
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OnchainKit](https://onchainkit.xyz/) for blockchain integration
- [Base](https://base.org/) for the blockchain infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Viem](https://viem.sh/) for Ethereum interactions

## 📞 Support

- Create an issue for bug reports or feature requests
- Join the [Base Discord](https://discord.gg/buildonbase) for community support
- Check the [OnchainKit documentation](https://docs.base.org/onchainkit) for API references

---

Built with ❤️ for the Base ecosystem
