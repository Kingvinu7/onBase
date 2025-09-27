'use client';

import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.disclaimer}>
          <h3 className={styles.disclaimerTitle}>ℹ️ About This Data</h3>
          <p className={styles.disclaimerText}>
            All analytics data is sourced directly from the Base blockchain network. 
            While we strive for accuracy, blockchain data may have minor delays or inconsistencies. 
            This tool is designed for informational purposes and fun exploration of onchain activity.
          </p>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            Built with ❤️ for the Base ecosystem • {new Date().getFullYear()}
          </p>
          <p className={styles.tagline}>
            For information purposes and fun only
          </p>
        </div>
      </div>
    </footer>
  );
}