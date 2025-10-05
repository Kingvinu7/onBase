/**
 * Environment variable validation and configuration
 */

interface EnvConfig {
  etherscanApiKey: string | null;
  isDevelopment: boolean;
  isProduction: boolean;
  baseUrl: string;
}

/**
 * Validates and extracts environment variables
 */
export function getEnvConfig(): EnvConfig {
  const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || null;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://onbase-six.vercel.app';

  return {
    etherscanApiKey,
    isDevelopment,
    isProduction,
    baseUrl,
  };
}

/**
 * Validates if required environment variables are present
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Optional but recommended
  if (!process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY) {
    missing.push('NEXT_PUBLIC_ETHERSCAN_API_KEY (optional but recommended for better API limits)');
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Gets API configuration with fallbacks
 */
export function getApiConfig() {
  const env = getEnvConfig();
  
  return {
    etherscanApiKey: env.etherscanApiKey || 'YourApiKeyToken',
    hasValidApiKey: env.etherscanApiKey !== null && env.etherscanApiKey !== 'YourApiKeyToken',
    baseUrl: env.baseUrl,
  };
}

/**
 * Logs environment status for debugging
 */
export function logEnvironmentStatus() {
  const env = getEnvConfig();
  const validation = validateEnvironment();
  
  console.log('🔧 Environment Configuration:', {
    nodeEnv: process.env.NODE_ENV,
    hasEtherscanKey: !!env.etherscanApiKey,
    baseUrl: env.baseUrl,
    isValid: validation.isValid,
    missing: validation.missing,
  });
}