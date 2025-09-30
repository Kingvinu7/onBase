'use client';

import { AddressAnalytics } from '../types/analytics';
import { AnalyticsService } from '../services/analyticsService';
import { MetricCard } from './MetricCard';
import { ShareButton } from './ShareButton';
import styles from './AnalyticsDashboard.module.css';

// Helper functions for address profiling
function getAddressName(analytics: AddressAnalytics): string {
  const { totalTransactions, contractInteractions, totalValueTransferred, activeDays } = analytics;
  const contractRatio = contractInteractions / Math.max(totalTransactions, 1);
  const avgDailyTxs = totalTransactions / Math.max(activeDays, 1);
  const totalEth = Number(AnalyticsService.formatEth(totalValueTransferred));

  // High-volume trader
  if (totalEth > 100 && avgDailyTxs > 10) return "🐋 Whale Trader";
  
  // DeFi power user
  if (contractRatio > 0.8 && totalTransactions > 100) return "🚀 DeFi Power User";
  
  // Bot or automated
  if (avgDailyTxs > 20 && contractRatio > 0.9) return "🤖 Trading Bot";
  
  // NFT collector
  if (contractRatio > 0.6 && totalEth < 10) return "🎨 NFT Collector";
  
  // Active trader
  if (totalTransactions > 200 && activeDays > 30) return "📈 Active Trader";
  
  // Contract deployer
  if (contractRatio > 0.5 && totalTransactions < 50) return "⚙️ Contract Deployer";
  
  // Regular user
  if (totalTransactions > 50) return "👤 Regular User";
  
  // New user
  if (totalTransactions < 10) return "🌱 New User";
  
  // Default
  return "📊 Base User";
}

function getAddressIcon(analytics: AddressAnalytics): string {
  const { totalTransactions, contractInteractions, totalValueTransferred } = analytics;
  const contractRatio = contractInteractions / Math.max(totalTransactions, 1);
  const totalEth = Number(AnalyticsService.formatEth(totalValueTransferred));

  if (totalEth > 100) return "🐋";
  if (contractRatio > 0.8) return "🚀";
  if (contractRatio > 0.6) return "🎨";
  if (totalTransactions > 200) return "📈";
  if (totalTransactions < 10) return "🌱";
  return "👤";
}

function getAddressDescription(analytics: AddressAnalytics): string {
  const { totalTransactions, contractInteractions, activeDays, activityStreak } = analytics;
  const contractRatio = contractInteractions / Math.max(totalTransactions, 1);
  const avgDailyTxs = totalTransactions / Math.max(activeDays, 1);

  const traits = [];
  
  if (avgDailyTxs > 10) traits.push("high-frequency trader");
  else if (avgDailyTxs > 2) traits.push("active trader");
  else traits.push("casual user");

  if (contractRatio > 0.8) traits.push("DeFi enthusiast");
  else if (contractRatio > 0.5) traits.push("contract user");

  if (activityStreak.longestStreak > 30) traits.push("consistent user");
  else if (activityStreak.longestStreak > 7) traits.push("regular user");

  if (activeDays > 100) traits.push("long-term Base user");
  else if (activeDays > 30) traits.push("established user");
  else traits.push("newer to Base");

  return `A ${traits.join(", ")} with ${activeDays} active days on Base network.`;
}

interface AnalyticsDashboardProps {
  analytics: AddressAnalytics;
  loading?: boolean;
}

export function AnalyticsDashboard({ analytics, loading = false }: AnalyticsDashboardProps) {
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div className={styles.skeleton} style={{ width: '300px', height: '32px' }} />
          <div className={styles.skeleton} style={{ width: '200px', height: '16px', marginTop: '8px' }} />
        </div>
        
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricCard
              key={i}
              title=""
              value=""
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDaysSince = (dateString: string | null) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Analytics for {formatAddress(analytics.address)}
        </h1>
        <p className={styles.subtitle}>
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </p>
      </div>

      <div className={styles.grid}>
        <MetricCard
          title="Total Transactions"
          value={AnalyticsService.formatNumber(analytics.totalTransactions)}
          subtitle={`Since ${formatDate(analytics.firstTransactionDate)}`}
          icon="📊"
        />

        <MetricCard
          title="ETH Balance"
          value={`${AnalyticsService.formatEth(analytics.ethBalance)} ETH`}
          subtitle="Current balance"
          icon="💰"
        />

        <MetricCard
          title="Active Days"
          value={analytics.activeDays}
          subtitle={`Out of ${calculateDaysSince(analytics.firstTransactionDate)} total days`}
          icon="📅"
        />

        <MetricCard
          title="Active Months"
          value={analytics.activeMonths}
          subtitle="Months with activity"
          icon="🗓️"
        />

        <MetricCard
          title="Current Streak"
          value={analytics.activityStreak.currentStreak}
          subtitle={analytics.activityStreak.isActive ? "Active streak" : "No current streak"}
          icon="🔥"
          trend={analytics.activityStreak.isActive ? 'up' : 'neutral'}
          trendValue={analytics.activityStreak.isActive ? 'Active' : 'Inactive'}
        />

        <MetricCard
          title="Longest Streak"
          value={analytics.activityStreak.longestStreak}
          subtitle={`Best streak: ${analytics.activityStreak.longestStreak} days`}
          icon="🏆"
        />

        <MetricCard
          title="Total Value Moved"
          value={`${AnalyticsService.formatEth(analytics.totalValueTransferred)} ETH`}
          subtitle="Lifetime transaction volume"
          icon="💸"
        />

        <MetricCard
          title="Gas Spent"
          value={`${AnalyticsService.formatEth(analytics.totalGasSpent)} ETH`}
          subtitle={`Avg: ${AnalyticsService.formatEth(analytics.averageGasPrice)} gwei`}
          icon="⛽"
        />

        <MetricCard
          title="Unique Interactions"
          value={AnalyticsService.formatNumber(analytics.uniqueInteractedAddresses)}
          subtitle="Different addresses interacted with"
          icon="🤝"
        />

        <MetricCard
          title="Contract Interactions"
          value={AnalyticsService.formatNumber(analytics.contractInteractions)}
          subtitle={`${Math.round((analytics.contractInteractions / Math.max(analytics.totalTransactions, 1)) * 100)}% of transactions`}
          icon="📜"
        />

        <MetricCard
          title="First Transaction"
          value={formatDate(analytics.firstTransactionDate)}
          subtitle={`${calculateDaysSince(analytics.firstTransactionDate)} days ago`}
          icon="🎯"
        />

        <MetricCard
          title="Last Activity"
          value={formatDate(analytics.lastTransactionDate)}
          subtitle={`${calculateDaysSince(analytics.lastTransactionDate)} days ago`}
          icon="⏰"
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Address Profile</h2>
        <div className={styles.profileCard}>
          <div className={styles.profileIcon}>{getAddressIcon(analytics)}</div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{getAddressName(analytics)}</h3>
            <p className={styles.profileDescription}>{getAddressDescription(analytics)}</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Share Your Analytics</h2>
        <div className={styles.shareSection}>
          <p className={styles.shareDescription}>
            Share your Base analytics with the community and discover others' onchain journeys!
          </p>
          <ShareButton analytics={analytics} />
        </div>
      </div>
    </div>
  );
}