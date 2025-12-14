import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

/**
 * Firebase Service
 * 
 * Initializes Firebase Admin SDK and provides access to Firebase services.
 * Uses environment variables for secure credential management.
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize Firebase Admin SDK on module initialization
   * Uses service account credentials from environment variables
   */
  async onModuleInit() {
    // Check if already initialized to prevent multiple initializations
    if (admin.apps.length > 0) {
      this.firebaseApp = admin.apps[0];
      return;
    }

    // Get Firebase credentials from environment variables
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n'); // Handle newlines in private key

    // Validate required credentials
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase credentials. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in environment variables.',
      );
    }

    try {
      // Initialize Firebase Admin SDK
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Get Firebase Admin instance
   * @returns Firebase Admin App instance
   */
  getAdmin(): admin.app.App {
    if (!this.firebaseApp) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return this.firebaseApp;
  }

  /**
   * Get Firebase Auth instance
   * @returns Firebase Auth service
   */
  getAuth(): admin.auth.Auth {
    return this.getAdmin().auth();
  }

  /**
   * Verify Firebase ID token
   * @param token - Firebase ID token from client
   * @returns Decoded token payload
   */
  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.getAuth().verifyIdToken(token);
    } catch (error) {
      throw new Error(`Invalid or expired token: ${error.message}`);
    }
  }

  /**
   * Generate password reset link for user
   * @param email - User email address
   * @returns Password reset link
   */
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const link = await this.getAuth().generatePasswordResetLink(email);
      return link;
    } catch (error) {
      throw new Error(`Failed to generate reset link: ${error.message}`);
    }
  }

  /**
   * Get user by email
   * @param email - User email address
   * @returns Firebase user record
   */
  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().getUserByEmail(email);
    } catch (error) {
      throw new Error(`User not found: ${error.message}`);
    }
  }

  /**
   * Get user by UID
   * @param uid - Firebase user UID
   * @returns Firebase user record
   */
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().getUser(uid);
    } catch (error) {
      throw new Error(`User not found: ${error.message}`);
    }
  }

  /**
   * Update user password (admin operation)
   * @param uid - Firebase user UID
   * @param newPassword - New password (minimum 8 characters)
   */
  async updateUserPassword(uid: string, newPassword: string): Promise<void> {
    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    try {
      await this.getAuth().updateUser(uid, {
        password: newPassword,
      });
    } catch (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }
}

