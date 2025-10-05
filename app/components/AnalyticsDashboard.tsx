'use client';

import { AddressAnalytics } from '../types/analytics';
import { AnalyticsService } from '../services/analyticsService';
import { MetricCard } from './MetricCard';
import { ShareButton } from './ShareButton';
import { ADDRESS_PROFILES, UI_CONFIG } from '../constants/config';
import styles from './AnalyticsDashboard.module.css';

// Helper functions for address profiling
function getAddressName(analytics: AddressAnalytics): string {
  const { totalTransactions, contractInteractions, totalValueTransferred, activeDays } = analytics;
  const contractRatio = contractInteractions / Math.max(totalTransactions, 1);
  const avgDailyTxs = totalTransactions / Math.max(activeDays, 1);
  const totalEth = Number(AnalyticsService.formatEth(totalValueTransferred));

  // High-volume trader
  if (totalEth > ADDRESS_PROFILES.whaleTrader.minEth && avgDailyTxs > ADDRESS_PROFILES.whaleTrader.minDailyTxs) {
    return ADDRESS_PROFILES.whaleTrader.name;
  }
  
  // DeFi power user
  if (contractRatio > ADDRESS_PROFILES.defiPowerUser.minContractRatio && totalTransactions > ADDRESS_PROFILES.defiPowerUser.minTransactions) {
    return ADDRESS_PROFILES.defiPowerUser.name;
  }
  
  // Bot or automated
  if (avgDailyTxs > ADDRESS_PROFILES.tradingBot.minDailyTxs && contractRatio > ADDRESS_PROFILES.tradingBot.minContractRatio) {
    return ADDRESS_PROFILES.tradingBot.name;
  }
  
  // NFT collector
  if (contractRatio > ADDRESS_PROFILES.nftCollector.minContractRatio && totalEth < ADDRESS_PROFILES.nftCollector.maxEth) {
    return ADDRESS_PROFILES.nftCollector.name;
  }
  
  // Active trader
  if (totalTransactions > ADDRESS_PROFILES.activeTrader.minTransactions && activeDays > ADDRESS_PROFILES.activeTrader.minActiveDays) {
    return ADDRESS_PROFILES.activeTrader.name;
  }
  
  // Contract deployer
  if (contractRatio > ADDRESS_PROFILES.contractDeployer.minContractRatio && totalTransactions < ADDRESS_PROFILES.contractDeployer.maxTransactions) {
    return ADDRESS_PROFILES.contractDeployer.name;
  }
  
  // Regular user
  if (totalTransactions > ADDRESS_PROFILES.regularUser.minTransactions) {
    return ADDRESS_PROFILES.regularUser.name;
  }
  
  // New user
  if (totalTransactions < ADDRESS_PROFILES.newUser.maxTransactions) {
    return ADDRESS_PROFILES.newUser.name;
  }
  
  // Default
  return ADDRESS_PROFILES.default.name;
}

function getAddressIcon(analytics: AddressAnalytics): string {
  const { totalTransactions, contractInteractions, totalValueTransferred } = analytics;
  const contractRatio = contractInteractions / Math.max(totalTransactions, 1);
  const totalEth = Number(AnalyticsService.formatEth(totalValueTransferred));

  if (totalEth > ADDRESS_PROFILES.whaleTrader.minEth) return ADDRESS_PROFILES.whaleTrader.icon;
  if (contractRatio > ADDRESS_PROFILES.defiPowerUser.minContractRatio) return ADDRESS_PROFILES.defiPowerUser.icon;
  if (contractRatio > ADDRESS_PROFILES.nftCollector.minContractRatio) return ADDRESS_PROFILES.nftCollector.icon;
  if (totalTransactions > ADDRESS_PROFILES.activeTrader.minTransactions) return ADDRESS_PROFILES.activeTrader.icon;
  if (totalTransactions < ADDRESS_PROFILES.newUser.maxTransactions) return ADDRESS_PROFILES.newUser.icon;
  return ADDRESS_PROFILES.default.icon;
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
          {Array.from({ length: UI_CONFIG.loading.skeletonCount }).map((_, i) => (
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
    return `${address.slice(0, UI_CONFIG.address.displayLength)}...${address.slice(-4)}`;
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
    <div className={styles.dashboard} role="main" aria-label="Address analytics dashboard">
      <div className={styles.header}>
        <h1 className={styles.title} id="analytics-title">
          Analytics for {formatAddress(analytics.address)}
        </h1>
        <p className={styles.subtitle} aria-describedby="analytics-title">
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </p>
      </div>

      <div className={styles.grid} role="grid" aria-label="Analytics metrics">
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
          title="Transaction Volume"
          value={`${AnalyticsService.formatEth(analytics.totalValueTransferred)} ETH`}
          subtitle="Total value transferred"
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

      <section className={styles.section} aria-labelledby="profile-title">
        <h2 className={styles.sectionTitle} id="profile-title">Address Profile</h2>
        <div className={styles.profileCard} role="complementary" aria-label="Address profile information">
          <div className={styles.profileIcon} aria-hidden="true">{getAddressIcon(analytics)}</div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{getAddressName(analytics)}</h3>
            <p className={styles.profileDescription}>{getAddressDescription(analytics)}</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="share-title">
        <h2 className={styles.sectionTitle} id="share-title">Share Your Analytics</h2>
        <div className={styles.shareSection}>
          <p className={styles.shareDescription}>
            Share your Base analytics with the community and discover others&apos; onchain journeys!
          </p>
          <ShareButton analytics={analytics} />
        </div>
      </section>
    </div>
  );
}