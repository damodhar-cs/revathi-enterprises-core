/**
 * Authenticated User Interface
 * 
 * Represents the decoded Firebase token payload attached to request.user
 * after successful JWT verification by FirebaseAuthGuard.
 */
export interface AuthenticatedUser {
  /** Firebase user unique identifier */
  uid: string;

  /** User email address (if available) */
  email?: string;

  /** User's email verification status */
  email_verified?: boolean;

  /** User's display name (if set) */
  name?: string;

  /** User's profile picture URL (if available) */
  picture?: string;

  /** Token issued at timestamp (seconds since epoch) */
  iat?: number;

  /** Token expiration timestamp (seconds since epoch) */
  exp?: number;

  /** Firebase Auth time (seconds since epoch) */
  auth_time?: number;
}

/**
 * Extend Express Request to include authenticated user
 */
declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

