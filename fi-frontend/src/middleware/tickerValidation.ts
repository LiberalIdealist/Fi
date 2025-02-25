import { INDIAN_COMPANIES } from '../utils/constants';

export function validateTicker(ticker: string): boolean {
  return INDIAN_COMPANIES.includes(ticker.toUpperCase());
}