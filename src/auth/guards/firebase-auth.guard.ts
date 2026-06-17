import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Firebase Authentication Guard
 * 
 * Controller-level guard that validates Firebase JWT tokens.
 * 
 * Usage:
 * @UseGuards(FirebaseAuthGuard)
 * @Controller('protected-route')
 * export class ProtectedController { ... }
 * 
 * Features:
 * - Extracts JWT from Authorization: Bearer <token> header
 * - Verifies token using Firebase Admin SDK
 * - Attaches decoded token to request.user
 * - Throws UnauthorizedException on invalid/missing token
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Validate request authentication
   * @param context - Execution context containing HTTP request
   * @returns true if authenticated, throws UnauthorizedException otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Missing authentication token. Please provide a valid Bearer token in the Authorization header.',
      );
    }

    try {
      // Verify token using Firebase Admin SDK
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Attach authenticated user to request object
      const user: AuthenticatedUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        iat: decodedToken.iat,
        exp: decodedToken.exp,
        auth_time: decodedToken.auth_time,
      };

      request.user = user;

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid or expired token';
      throw new UnauthorizedException(`Authentication failed: ${message}`);
    }
  }

  /**
   * Extract JWT token from request headers.
   * Checks Authorization: Bearer <token> first, then falls back to
   * X-Firebase-Token header (needed when reverse proxies strip Authorization).
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers?.authorization;

    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      // Case-insensitive check to handle proxies that lowercase the value
      if (type?.toLowerCase() === 'bearer' && token) {
        return token;
      }
    }

    // Fallback: some hosting reverse proxies strip the Authorization header.
    // The frontend sends X-Firebase-Token as a redundant channel.
    const xToken = request.headers?.['x-firebase-token'];
    if (xToken) {
      return xToken;
    }

    return null;
  }
}

