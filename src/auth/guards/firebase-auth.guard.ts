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
      // Token verification failed
      throw new UnauthorizedException(
        `Authentication failed: ${error.message || 'Invalid or expired token'}`,
      );
    }
  }

  /**
   * Extract JWT token from Authorization header
   * @param request - HTTP request object
   * @returns Extracted token or null
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      return null;
    }

    // Expected format: "Bearer <token>"
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}

