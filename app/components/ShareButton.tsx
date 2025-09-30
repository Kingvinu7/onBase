'use client';

import { useState } from 'react';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  analytics: {
    address: string;
    totalTransactions: number;
    activeDays: number;
    uniqueInteractedAddresses: number;
  };
}

export function ShareButton({ analytics }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const generateCastText = () => {
    const castText = `🔍 Just analyzed my Base wallet with onBase!

📊 ${analytics.totalTransactions} transactions
📅 ${analytics.activeDays} active days  
🤝 ${analytics.uniqueInteractedAddresses} unique interactions

Discover your onchain journey at https://onbase-six.vercel.app

#Base #onchain #analytics #onBase`;

    return castText;
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const castText = generateCastText();
      
      // Try to use Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: 'My Base Analytics',
          text: castText,
          url: 'https://onbase-six.vercel.app'
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(castText);
        alert('Cast text copied to clipboard! You can now paste it in Farcaster.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(generateCastText());
        alert('Cast text copied to clipboard! You can now paste it in Farcaster.');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={styles.shareButton}
      disabled={isSharing}
    >
      {isSharing ? (
        <>
          <span className={styles.spinner}>⏳</span>
          Composing...
        </>
      ) : (
        <>
          <span className={styles.icon}>📝</span>
          Compose Cast
        </>
      )}
    </button>
  );
}