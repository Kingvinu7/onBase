"use client";
import { useEffect, useState } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { AddressInput } from "./components/AddressInput";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Footer } from "./components/Footer";
import { AnalyticsService } from "./services/analyticsService";
import { mockAnalyticsData } from "./utils/mockData";
import type { AddressAnalytics, AnalyticsError } from "./types/analytics";
import styles from "./page.module.css";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [analytics, setAnalytics] = useState<AddressAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  const handleAnalyze = async (address: string) => {
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
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        {!analytics && !loading && (
          <div className={styles.hero}>
            <div className={styles.heroIcon}>📊</div>
            <h1 className={styles.title}>Base Analytics</h1>
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
          />
          
          <div className={styles.demoSection}>
            <button 
              onClick={() => setAnalytics(mockAnalyticsData)}
              className={styles.demoButton}
              disabled={loading}
            >
              View Demo Analytics
            </button>
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
            
            <div className={styles.testAddresses}>
              <h3>Try these Base addresses:</h3>
              <div className={styles.addressList}>
                <code>0x4200000000000000000000000000000000000006</code> (WETH)
                <code>0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22</code> (Active wallet)
                <code>0x49048044D57e1C92A77f79988d21Fa8fAF74E97e</code> (Base Bridge)
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
