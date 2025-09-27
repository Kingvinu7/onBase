'use client';

import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.disclaimer}>
          <h3 className={styles.disclaimerTitle}>⚠️ Data Disclaimer</h3>
          <p className={styles.disclaimerText}>
            All analytics data is sourced directly from the Base blockchain network and external APIs. 
            While we strive for accuracy, blockchain data may have delays, inconsistencies, or missing information. 
            This tool is for informational purposes only and should not be used as the sole basis for financial decisions. 
            Always verify critical information through multiple sources.
          </p>
        </div>
        
        <div className={styles.info}>
          <div className={styles.infoSection}>
            <h4>Data Sources</h4>
            <ul>
              <li>Base Network RPC</li>
              <li>Etherscan v2 API</li>
              <li>Real-time blockchain data</li>
            </ul>
          </div>
          
          <div className={styles.infoSection}>
            <h4>Limitations</h4>
            <ul>
              <li>Data may have minor delays</li>
              <li>Some transactions might be missed</li>
              <li>API rate limits may apply</li>
            </ul>
          </div>
          
          <div className={styles.infoSection}>
            <h4>Built With</h4>
            <ul>
              <li>Next.js & OnchainKit</li>
              <li>Base Network</li>
              <li>Viem & Wagmi</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            Built with ❤️ for the Base ecosystem • {new Date().getFullYear()}
          </p>
          <p className={styles.warning}>
            Not financial advice • Use at your own risk • Verify all data independently
          </p>
        </div>
      </div>
    </footer>
  );
}