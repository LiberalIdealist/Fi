/**
 * Formatting utilities for the Fi application
 * These functions help maintain consistent data presentation throughout the app
 */

/**
 * Format a number as Indian currency (₹)
 * @param amount - The amount to format
 * @param currency - The currency symbol (₹ by default)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, currency = '₹'): string => {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  
  // Handle NaN or undefined values
  if (isNaN(amount)) return `${currency}0.00`;
  
  // Format according to Indian numbering system (lakhs, crores)
  return `${currency}${amount.toLocaleString('en-IN')}`;
};

/**
 * Format a number as percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (defaults to 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | string, decimals = 2): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  
  // Handle NaN or undefined values
  if (isNaN(value)) return '0.00%';
  
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format a date in a user-friendly format
 * @param date - Date to format (Date object, string, or timestamp)
 * @param format - Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Check for invalid date
  if (isNaN(d.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: format === 'short' ? 'short' : 'long', 
    year: 'numeric'
  };
  
  if (format === 'long') {
    options.weekday = 'long';
  }
  
  return d.toLocaleDateString('en-IN', options);
};

/**
 * Format large numbers in Indian format (lakhs, crores)
 * @param num - Number to format
 * @param decimals - Number of decimal places for abbreviated numbers
 * @returns Formatted number string
 */
export const formatLargeNumber = (num: number | string, decimals = 2): string => {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  
  // Handle NaN or undefined values
  if (isNaN(num)) return '0';
  
  if (num >= 10000000) {
    // Convert to crores
    return `${(num / 10000000).toFixed(decimals)} Cr`;
  } else if (num >= 100000) {
    // Convert to lakhs
    return `${(num / 100000).toFixed(decimals)} L`;
  } else if (num >= 1000) {
    // Format with commas
    return num.toLocaleString('en-IN');
  }
  
  return num.toString();
};

/**
 * Format risk level to a user-friendly string
 * @param risk - Risk level string or number
 * @returns User-friendly risk description
 */
export const formatRiskLevel = (risk: string | number): string => {
  if (typeof risk === 'number') {
    // Convert numeric risk to category
    if (risk < 3) return 'Conservative';
    if (risk < 7) return 'Moderate';
    return 'Aggressive';
  }
  
  // Map string risk levels
  const riskMap: Record<string, string> = {
    'low': 'Conservative',
    'moderate': 'Balanced',
    'high': 'Aggressive',
    '1': 'Very Conservative',
    '2': 'Conservative',
    '3': 'Moderately Conservative',
    '4': 'Moderate',
    '5': 'Balanced',
    '6': 'Moderately Aggressive',
    '7': 'Aggressive',
    '8': 'Very Aggressive',
  };
  
  return riskMap[risk.toLowerCase()] || 'Moderate';
};

/**
 * Truncate text to a specific length and add ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a number as compact representation
 * @param value - Number to format
 * @returns Compact number representation
 */
export const formatCompactNumber = (value: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short'
  });
  
  return formatter.format(value);
};

/**
 * Convert snake_case or camelCase to Title Case for display
 * @param text - Text to convert
 * @returns Title cased text
 */
export const formatTitleCase = (text: string): string => {
  if (!text) return '';
  
  // Handle snake_case
  if (text.includes('_')) {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Handle camelCase
  return text
    // Insert space before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Uppercase the first character
    .replace(/^./, str => str.toUpperCase())
    .trim();
};