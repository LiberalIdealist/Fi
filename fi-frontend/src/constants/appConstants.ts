/**
 * Application-wide constants
 */

// Document processing status values
export const PROCESSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing", 
  COMPLETED: "completed",
  FAILED: "failed"
};

// Document types
export const DOCUMENT_TYPES = {
  BANK: "bank",
  CREDIT: "credit",
  DEMAT: "demat",
  TAX: "tax",
  OTHER: "other"
};

// Risk profile categories
export const RISK_PROFILES = {
  CONSERVATIVE: "Conservative",
  MODERATELY_CONSERVATIVE: "Moderately Conservative",
  MODERATE: "Moderate",
  MODERATELY_AGGRESSIVE: "Moderately Aggressive",
  AGGRESSIVE: "Aggressive"
};