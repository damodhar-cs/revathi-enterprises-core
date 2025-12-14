import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * Authentication Service
 * 
 * Handles authentication-related business logic using Firebase Admin SDK.
 * Provides methods for password management and user operations.
 */
@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Generate password reset link for user
   * 
   * Creates a secure password reset link that can be sent to the user's email.
   * The link expires after a certain period (default: 1 hour).
   * 
   * @param email - User's email address
   * @returns Password reset link URL
   * @throws Error if user not found or link generation fails
   */
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      // Verify user exists before generating link
      await this.firebaseService.getUserByEmail(email);

      // Generate password reset link
      const resetLink = await this.firebaseService.generatePasswordResetLink(email);

      return resetLink;
    } catch (error) {
      throw new Error(`Failed to generate password reset link: ${error.message}`);
    }
  }

  /**
   * Change user password
   * 
   * Updates the password for an authenticated user.
   * Requires the user's Firebase UID (obtained from verified token).
   * 
   * @param uid - Firebase user UID
   * @param newPassword - New password (minimum 8 characters)
   * @throws Error if password update fails or validation fails
   */
  async changePassword(uid: string, newPassword: string): Promise<void> {
    try {
      // Validate password strength
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Update password using Firebase Admin SDK
      await this.firebaseService.updateUserPassword(uid, newPassword);
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  /**
   * Get user profile information
   * 
   * Retrieves detailed user information from Firebase.
   * 
   * @param uid - Firebase user UID
   * @returns User record from Firebase
   * @throws Error if user not found
   */
  async getUserProfile(uid: string) {
    try {
      const user = await this.firebaseService.getUserByUid(uid);

      // Return relevant user information
      return {
        uid: user.uid,
        email: user.email,
        email_verified: user.emailVerified,
        display_name: user.displayName,
        photo_url: user.photoURL,
        disabled: user.disabled,
        created_at: user.metadata.creationTime,
        last_sign_in: user.metadata.lastSignInTime,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve user profile: ${error.message}`);
    }
  }
}
