/**
 * Type definitions for Flux Payment Platform
 * 
 * All types use strict TypeScript with no 'any' types.
 * Branded types are used for IDs to prevent mixing different entity IDs.
 * 
 * @module types
 */

/**
 * Branded type for compile-time ID safety
 * Prevents accidentally passing a CharityId where a UserId is expected
 */
type Brand<K, T> = K & { __brand: T };

/**
 * Charity identifier (branded string)
 */
export type CharityId = Brand<string, 'CharityId'>;

/**
 * User identifier (branded string)
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Transaction identifier (branded string)
 */
export type TransactionId = Brand<string, 'TransactionId'>;

/**
 * Donation identifier (branded string)
 */
export type DonationId = Brand<string, 'DonationId'>;

/**
 * Charity category for grouping and matching
 */
export type CharityCategory = 
  | 'hunger'
  | 'humanitarian'
  | 'emergency'
  | 'children'
  | 'education'
  | 'health'
  | 'environment'
  | 'animals'
  | 'veterans';

/**
 * Impact metric type
 * Different charities measure impact differently
 */
export type ImpactMetric =
  | 'meals'
  | 'families helped'
  | 'people helped'
  | 'children supported'
  | 'school days funded'
  | 'care packages'
  | 'medical supplies'
  | 'water filters'
  | 'trees planted'
  | 'animals rescued';

/**
 * Charity organization
 */
export interface Charity {
  /** Unique charity identifier */
  id: CharityId;
  
  /** Display name */
  name: string;
  
  /** Short description (1-2 sentences) */
  description: string;
  
  /** Emoji or icon identifier for visual representation */
  emoji: string;
  
  /** Whether charity is verified by Flux */
  verified: boolean;
  
  /** Number of donors who have contributed */
  donorCount: number;
  
  /** How impact is measured */
  impactMetric: ImpactMetric;
  
  /** Impact conversion rate (e.g., $1 = 2 meals) */
  impactRate: number;
  
  /** Category for matching and filtering */
  category: CharityCategory;
  
  /** Optional: Charity website URL */
  websiteUrl?: string;
  
  /** Optional: EIN/tax ID for US charities */
  taxId?: string;
}

/**
 * User profile
 */
export interface User {
  /** Unique user identifier */
  id: UserId;
  
  /** Full name */
  name: string;
  
  /** Email address */
  email: string;
  
  /** Current account balance in dollars */
  balance: number;
  
  /** Whether user has completed Wishing Well onboarding */
  hasCompletedOnboarding: boolean;
  
  /** Date of first donation (null if never donated) */
  firstDonationDate: Date | null;
  
  /** Total amount donated to charities (in dollars) */
  totalDonated: number;
  
  /** Total number of donations made */
  donationCount: number;
  
  /** Last time WW prompt was shown (for payday logic) */
  lastWWPromptShown: Date | null;
  
  /** Whether user dismissed WW prompt in current payday window */
  wwPromptDismissedForPayday: boolean;
  
  /** Optional: Profile photo URL */
  photoUrl?: string;
  
  /** Optional: Phone number */
  phone?: string;
  
  /** Account creation date */
  createdAt: Date;
  
  /** Last account update date */
  updatedAt: Date;
}

/**
 * Transaction type
 */
export type TransactionType = 
  | 'donation'
  | 'send'
  | 'receive'
  | 'deposit'
  | 'withdrawal';

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Base transaction (shared fields)
 */
interface BaseTransaction {
  /** Unique transaction identifier */
  id: TransactionId;
  
  /** User who initiated the transaction */
  userId: UserId;
  
  /** Transaction type */
  type: TransactionType;
  
  /** Transaction status */
  status: TransactionStatus;
  
  /** Amount in dollars (always positive) */
  amount: number;
  
  /** Platform fee in dollars (if applicable) */
  platformFee: number;
  
  /** Transaction timestamp */
  timestamp: Date;
  
  /** Optional: User-provided note/memo */
  note?: string;
}

/**
 * Donation transaction (extends base)
 */
export interface DonationTransaction extends BaseTransaction {
  type: 'donation';
  
  /** Charity that received the donation */
  charityId: CharityId;
  
  /** Charity name (denormalized for display) */
  charityName: string;
  
  /** Amount sent to charity (after platform fee) */
  charityAmount: number;
  
  /** Calculated impact (e.g., 20 meals) */
  impact: number;
  
  /** Impact metric (e.g., "meals") */
  impactMetric: ImpactMetric;
  
  /** AI insights generated from this donation */
  insights?: AIInsight[];
}

/**
 * Send money transaction
 */
export interface SendTransaction extends BaseTransaction {
  type: 'send';
  
  /** Recipient user ID */
  recipientId: UserId;
  
  /** Recipient name (denormalized) */
  recipientName: string;
  
  /** Optional: Recipient email */
  recipientEmail?: string;
}

/**
 * Receive money transaction
 */
export interface ReceiveTransaction extends BaseTransaction {
  type: 'receive';
  
  /** Sender user ID */
  senderId: UserId;
  
  /** Sender name (denormalized) */
  senderName: string;
}

/**
 * Union type for all transaction types
 */
export type Transaction = 
  | DonationTransaction 
  | SendTransaction 
  | ReceiveTransaction 
  | BaseTransaction;

/**
 * AI insight generated from donation behavior
 */
export interface AIInsight {
  /** Insight icon (emoji or identifier) */
  icon: string;
  
  /** Insight title/headline */
  title: string;
  
  /** Insight value/metric */
  value: string;
  
  /** Optional: Detailed description */
  description?: string;
  
  /** Optional: Action button label */
  actionLabel?: string;
  
  /** Optional: Action URL or handler */
  actionUrl?: string;
}

/**
 * Donation result (returned from API)
 */
export interface DonationResult {
  /** Whether donation was successful */
  success: boolean;
  
  /** Transaction ID */
  transactionId: TransactionId;
  
  /** Charity that received donation */
  charity: Charity;
  
  /** Total donation amount */
  amount: number;
  
  /** Platform fee */
  platformFee: number;
  
  /** Amount sent to charity */
  charityAmount: number;
  
  /** Calculated impact */
  impact: number;
  
  /** AI insights generated */
  insights: AIInsight[];
  
  /** Optional: Error message if failed */
  error?: string;
}

/**
 * Onboarding state
 */
export interface OnboardingState {
  /** Current step (1, 2, or 3) */
  currentStep: 1 | 2 | 3;
  
  /** Selected charity (null if not selected) */
  selectedCharity: Charity | null;
  
  /** Selected amount (null if not selected) */
  selectedAmount: number | null;
  
  /** Whether using custom amount */
  isCustomAmount: boolean;
  
  /** Whether donation is processing */
  isProcessing: boolean;
  
  /** Error message if any */
  error: string | null;
}

/**
 * Wishing Well prompt display mode
 */
export type WWPromptMode = 'prominent' | 'subtle' | 'hidden';

/**
 * API error response
 */
export interface APIError {
  /** Error code */
  code: string;
  
  /** User-friendly error message */
  message: string;
  
  /** Optional: Technical details (not shown to user) */
  details?: string;
  
  /** Optional: Suggested action */
  action?: string;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  /** Whether request was successful */
  success: boolean;
  
  /** Response data (if successful) */
  data?: T;
  
  /** Error (if failed) */
  error?: APIError;
}

/**
 * Form field validation state
 */
export interface FieldValidation {
  /** Whether field is valid */
  isValid: boolean;
  
  /** Error message (if invalid) */
  error?: string;
  
  /** Whether field has been touched/blurred */
  touched: boolean;
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  /** Whether currently loading */
  isLoading: boolean;
  
  /** Optional: Loading message */
  message?: string;
  
  /** Optional: Progress percentage (0-100) */
  progress?: number;
}

/**
 * Type guard to check if transaction is a donation
 */
export function isDonationTransaction(
  transaction: Transaction
): transaction is DonationTransaction {
  return transaction.type === 'donation';
}

/**
 * Type guard to check if transaction is a send
 */
export function isSendTransaction(
  transaction: Transaction
): transaction is SendTransaction {
  return transaction.type === 'send';
}

/**
 * Type guard to check if transaction is a receive
 */
export function isReceiveTransaction(
  transaction: Transaction
): transaction is ReceiveTransaction {
  return transaction.type === 'receive';
}

/**
 * Helper to create branded IDs
 */
export function createCharityId(id: string): CharityId {
  return id as CharityId;
}

export function createUserId(id: string): UserId {
  return id as UserId;
}

export function createTransactionId(id: string): TransactionId {
  return id as TransactionId;
}

export function createDonationId(id: string): DonationId {
  return id as DonationId;
}

/**
 * Helper to format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper to format large numbers (e.g., 45231 → "45.2K")
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Helper to format date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
