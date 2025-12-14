import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { AuthenticatedUser } from "./interfaces/authenticated-user.interface";

/**
 * DTO for password reset request
 */
export class ResetPasswordDto {
  email: string;
}

/**
 * DTO for password change request
 */
export class ChangePasswordDto {
  newPassword: string;
}

/**
 * Authentication Controller
 *
 * Handles Firebase-based authentication operations:
 * - Password reset email generation
 * - Password change for authenticated users
 * - User profile retrieval
 */
@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Send password reset email to authenticated user
   *
   * Gets user email from JWT token and sends password reset link.
   * User must be authenticated to request password reset.
   *
   * @param req - Request object containing authenticated user info
   * @returns Password reset confirmation
   */
  @Post("reset-password")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send password reset email to authenticated user" })
  @ApiResponse({
    status: 200,
    description:
      "Password reset link generated successfully. Copy this link and paste it in your browser to reset your password.",
    schema: {
      example: {
        link: "test-link.com",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing JWT token",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - User not found",
  })
  async resetPassword(@Request() req: any) {
    // Get email from authenticated user (decoded from JWT by FirebaseAuthGuard)
    // req.user contains the decoded Firebase ID token
    const userEmail = req.user?.email;

    if (!userEmail) {
      return {
        statusCode: 401,
        message: "User email not found in authentication token",
      };
    }

    try {
      const resetLink =
        await this.authService.generatePasswordResetLink(userEmail);

      return {
        message: "Password reset link generated successfully",
        email: userEmail,
        resetLink, // Return link for UI display
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message || "Failed to send password reset email",
      };
    }
  }

  /**
   * Change password for authenticated user
   *
   * Requires valid Firebase authentication token.
   * Updates the user's password using Firebase Admin SDK.
   *
   * @param request - HTTP request containing authenticated user
   * @param body - Contains new password
   * @returns Success message
   */
  @Post("change-password")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change password for authenticated user" })
  @ApiResponse({
    status: 200,
    description: "Password changed successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid password (must be at least 8 characters)",
  })
  async changePassword(
    @Request() req: { user: AuthenticatedUser },
    @Body() body: ChangePasswordDto
  ) {
    const { newPassword } = body;

    // Validate password presence
    if (!newPassword || !newPassword.trim()) {
      return {
        statusCode: 400,
        message: "New password is required",
      };
    }

    // Validate password length (minimum 8 characters)
    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        message: "Password must be at least 8 characters long",
      };
    }

    try {
      await this.authService.changePassword(req.user.uid, newPassword);

      return {
        message: "Password changed successfully",
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message || "Failed to change password",
      };
    }
  }

  /**
   * Get authenticated user profile
   *
   * Requires valid Firebase authentication token.
   * Returns the decoded token information.
   *
   * @param request - HTTP request containing authenticated user
   * @returns User profile information
   */
  @Get("profile")
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user profile" })
  @ApiResponse({
    status: 200,
    description: "Profile retrieved successfully",
    schema: {
      example: {
        uid: "firebase-user-id",
        email: "user@example.com",
        email_verified: true,
        name: "John Doe",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  async getProfile(@Request() req: { user: AuthenticatedUser }) {
    // Return the authenticated user information from the token
    return req.user;
  }
}
