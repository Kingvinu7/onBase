/**
 * Data validation utilities for address analytics
 */

import { isAddress } from 'viem';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Ethereum address format
 */
export function validateAddress(address: string): ValidationResult {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      error: 'Address is required and must be a string'
    };
  }

  if (address.length !== 42) {
    return {
      isValid: false,
      error: 'Address must be 42 characters long'
    };
  }

  if (!address.startsWith('0x')) {
    return {
      isValid: false,
      error: 'Address must start with 0x'
    };
  }

  if (!isAddress(address)) {
    return {
      isValid: false,
      error: 'Invalid Ethereum address format'
    };
  }

  return { isValid: true };
}

/**
 * Validates transaction data structure
 */
export function validateTransaction(tx: unknown): ValidationResult {
  if (!tx || typeof tx !== 'object') {
    return {
      isValid: false,
      error: 'Transaction must be an object'
    };
  }

  const transaction = tx as Record<string, unknown>;

  const requiredFields = ['hash', 'blockNumber', 'timestamp', 'from', 'value'];
  for (const field of requiredFields) {
    if (!(field in transaction)) {
      return {
        isValid: false,
        error: `Transaction missing required field: ${field}`
      };
    }
  }

  if (typeof transaction.hash !== 'string' || !transaction.hash.startsWith('0x')) {
    return {
      isValid: false,
      error: 'Transaction hash must be a valid hex string'
    };
  }

  return { isValid: true };
}

/**
 * Validates analytics data structure
 */
export function validateAnalytics(analytics: unknown): ValidationResult {
  if (!analytics || typeof analytics !== 'object') {
    return {
      isValid: false,
      error: 'Analytics data must be an object'
    };
  }

  const data = analytics as Record<string, unknown>;

  const requiredFields = [
    'address',
    'totalTransactions',
    'ethBalance',
    'lastUpdated'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return {
        isValid: false,
        error: `Analytics data missing required field: ${field}`
      };
    }
  }

  // Validate address format
  const addressValidation = validateAddress(data.address as string);
  if (!addressValidation.isValid) {
    return addressValidation;
  }

  // Validate numeric fields
  if (typeof data.totalTransactions !== 'number' || data.totalTransactions < 0) {
    return {
      isValid: false,
      error: 'Total transactions must be a non-negative number'
    };
  }

  if (typeof data.lastUpdated !== 'number' || data.lastUpdated <= 0) {
    return {
      isValid: false,
      error: 'Last updated must be a positive timestamp'
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes search input
 */
export function validateSearchInput(input: string): ValidationResult {
  const sanitized = sanitizeInput(input);
  
  if (!sanitized) {
    return {
      isValid: false,
      error: 'Search input cannot be empty'
    };
  }

  if (sanitized.length > 100) {
    return {
      isValid: false,
      error: 'Search input is too long (max 100 characters)'
    };
  }

  return validateAddress(sanitized);
}

/**
 * Validates API response structure
 */
export function validateApiResponse(response: unknown): ValidationResult {
  if (!response || typeof response !== 'object') {
    return {
      isValid: false,
      error: 'API response must be an object'
    };
  }

  const data = response as Record<string, unknown>;

  if (!('status' in data)) {
    return {
      isValid: false,
      error: 'API response missing status field'
    };
  }

  if (data.status === '0' && 'message' in data) {
    return {
      isValid: false,
      error: `API error: ${data.message}`
    };
  }

  return { isValid: true };
}