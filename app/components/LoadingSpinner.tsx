'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
};

export function LoadingSpinner({ 
  size = 'medium', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loading component for cards
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Loading overlay component
export function LoadingOverlay({ 
  isVisible, 
  text = 'Processing...' 
}: { 
  isVisible: boolean; 
  text?: string; 
}) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Loading overlay"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
}

// Progress bar component
export function ProgressBar({ 
  progress, 
  total = 100, 
  label 
}: { 
  progress: number; 
  total?: number; 
  label?: string; 
}) {
  const percentage = Math.min((progress / total) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  );
}