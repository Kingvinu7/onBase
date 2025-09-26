'use client';

import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  loading = false,
  className = ''
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles.loading} ${className}`}>
        <div className={styles.header}>
          <div className={styles.skeleton} style={{ width: '60%', height: '14px' }} />
          {icon && <div className={styles.iconSkeleton} />}
        </div>
        <div className={styles.skeleton} style={{ width: '80%', height: '32px', marginTop: '12px' }} />
        {subtitle && (
          <div className={styles.skeleton} style={{ width: '40%', height: '12px', marginTop: '8px' }} />
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
      
      <div className={styles.valueSection}>
        <div className={styles.value}>{value}</div>
        
        {trend && trendValue && (
          <div className={`${styles.trend} ${styles[trend]}`}>
            <span className={styles.trendIcon}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
            {trendValue}
          </div>
        )}
      </div>
      
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}