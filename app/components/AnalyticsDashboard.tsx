'use client';

import { AddressAnalytics } from '../types/analytics';
import { AnalyticsService } from '../services/analyticsService';
import { MetricCard } from './MetricCard';
import styles from './AnalyticsDashboard.module.css';

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

      {analytics.monthlyActivity.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Monthly Activity</h2>
          <div className={styles.activityGrid}>
            {analytics.monthlyActivity.slice(0, 6).map((month) => (
              <div key={month.month} className={styles.activityCard}>
                <div className={styles.activityMonth}>{month.month}</div>
                <div className={styles.activityStats}>
                  <div className={styles.activityStat}>
                    <span className={styles.activityValue}>{month.transactionCount}</span>
                    <span className={styles.activityLabel}>Transactions</span>
                  </div>
                  <div className={styles.activityStat}>
                    <span className={styles.activityValue}>{month.activeDays}</span>
                    <span className={styles.activityLabel}>Active Days</span>
                  </div>
                  <div className={styles.activityStat}>
                    <span className={styles.activityValue}>{AnalyticsService.formatEth(month.totalValue, 2)}</span>
                    <span className={styles.activityLabel}>ETH Moved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}