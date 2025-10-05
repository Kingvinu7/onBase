"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { AddressInput } from "./components/AddressInput";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Footer } from "./components/Footer";
import { AnalyticsService } from "./services/analyticsService";
import { mockAnalyticsData } from "./utils/mockData";
import { TEST_ADDRESSES } from "./constants/config";
import type { AddressAnalytics, AnalyticsError } from "./types/analytics";
import styles from "./page.module.css";

// Memoized features component for better performance
const FeaturesSection = React.memo(() => (
  <div className={styles.features}>
    <h2 className={styles.featuresTitle}>What you&apos;ll discover</h2>
    <div className={styles.featureGrid}>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>💰</div>
        <h3>Balance & Volume</h3>
        <p>Current ETH balance and total value transferred</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>📈</div>
        <h3>Activity Patterns</h3>
        <p>Daily and monthly activity breakdown with trends</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>🔥</div>
        <h3>Streaks & Consistency</h3>
        <p>Activity streaks and engagement patterns</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>🤝</div>
        <h3>Network Analysis</h3>
        <p>Unique interactions and contract usage</p>
      </div>
    </div>
  </div>
));

FeaturesSection.displayName = 'FeaturesSection';

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const { address: connectedAddress, isConnected } = useAccount();
  const [analytics, setAnalytics] = useState<AddressAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  const handleAnalyze = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    setAnalytics(null);

    try {
      const analyticsService = AnalyticsService.getInstance();
      
      // First test the API
      console.log('🧪 Testing Etherscan v2 API connection...');
      await analyticsService.testEtherscanAPI(address);
      
      const result = await analyticsService.analyzeAddress(address);
      setAnalytics(result);
    } catch (err) {
      const error = err as AnalyticsError;
      setError(error.message || 'Failed to analyze address');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalyzeConnectedWallet = useCallback(async () => {
    if (!connectedAddress) {
      setError('Please connect your wallet first');
      return;
    }
    
    console.log('🔗 Analyzing connected wallet:', connectedAddress);
    await handleAnalyze(connectedAddress);
  }, [connectedAddress, handleAnalyze]);

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div className={styles.headerLeft}>
          <h1 className={styles.appName}>onBase</h1>
        </div>
        <div className={styles.headerRight}>
          <Wallet />
        </div>
      </header>

      <div className={styles.content}>
        {!analytics && !loading && (
          <div className={styles.hero}>
            <div className={styles.heroIcon}>📊</div>
            <h1 className={styles.title}>onBase</h1>
            <p className={styles.description}>
              Discover comprehensive insights about any Base address including transaction history, 
              activity patterns, streaks, and more.
            </p>
          </div>
        )}

        <div className={styles.inputSection}>
          <AddressInput 
            onAnalyze={handleAnalyze}
            loading={loading}
            placeholder={isConnected ? 
              `Enter any Base address or use "Analyze My Wallet" below...` : 
              "Enter Base address to analyze..."
            }
          />
          
          <div className={styles.actionButtons}>
            {isConnected && connectedAddress && (
              <button 
                onClick={handleAnalyzeConnectedWallet}
                className={styles.walletButton}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : `Analyze My Wallet (${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)})`}
              </button>
            )}
            
            <button 
              onClick={useCallback(() => setAnalytics(mockAnalyticsData), [])}
              className={styles.demoButton}
              disabled={loading}
            >
              View Demo Analytics
            </button>
            
            {!isConnected && (
              <p className={styles.walletHint}>
                💡 Connect your wallet above to analyze your own address instantly!
              </p>
            )}
          </div>
          
          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}
        </div>

        {(loading || analytics) && (
          <div className={styles.dashboardSection}>
            <AnalyticsDashboard 
              analytics={analytics!}
              loading={loading}
            />
          </div>
        )}

        {!analytics && !loading && !error && (
          <>
            <FeaturesSection />
            
            <div className={styles.testAddresses}>
              <h3>Try these Base addresses:</h3>
              <div className={styles.addressList}>
                {TEST_ADDRESSES.map((address, index) => {
                  const labels = ['WETH', 'Active wallet', 'Base Bridge'];
                  return (
                    <code key={address} onClick={() => handleAnalyze(address)} style={{ cursor: 'pointer' }}>
                      {address} ({labels[index]})
                    </code>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
