'use client';

import { useState } from 'react';
import { isAddress } from 'viem';
import styles from './AddressInput.module.css';

interface AddressInputProps {
  onAnalyze: (address: string) => void;
  loading: boolean;
  placeholder?: string;
}

export function AddressInput({ onAnalyze, loading, placeholder = "Enter Base address to analyze..." }: AddressInputProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!isAddress(address.trim())) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setError('');
    onAnalyze(address.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !address.trim()}
            className={styles.button}
          >
            {loading ? (
              <div className={styles.spinner} />
            ) : (
              'Analyze'
            )}
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}