'use client';

import { useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
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

#Base #onchain #analytics #onBase`;

    return castText;
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const castText = generateCastText();
      
      // Check if SDK is available
      if (!sdk || !sdk.actions || !sdk.actions.composeCast) {
        throw new Error('Farcaster SDK not available');
      }
      
      // Use Farcaster miniapp SDK composeCast function
      const result = await sdk.actions.composeCast({
        text: castText,
        embeds: ['https://onbase-six.vercel.app']
        // Removed channelKey to avoid potential errors
      });

      // Handle the result
      if (result?.cast) {
        console.log('Cast posted successfully!');
        console.log('Cast Hash:', result.cast.hash);
        if (result.cast.channelKey) {
          console.log('Posted to channel:', result.cast.channelKey);
        }
        // Show success message
        alert('Cast posted successfully! 🎉');
      } else {
        console.log('User canceled the cast.');
        // User canceled, no need to show error
      }
    } catch (error) {
      console.error('Error composing cast:', error);
      
      // Fallback to Web Share API if SDK fails
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'My Base Analytics',
            text: generateCastText(),
            url: 'https://onbase-six.vercel.app'
          });
        } else {
          // Final fallback - copy to clipboard
          await navigator.clipboard.writeText(generateCastText());
          alert('Cast text copied to clipboard! You can now paste it in Farcaster.');
        }
      } catch (fallbackError) {
        console.error('Fallback sharing error:', fallbackError);
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