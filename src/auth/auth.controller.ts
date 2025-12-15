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

      // Create email template with Firebase reset link
      const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Revathi Enterprises</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Revathi Enterprises</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-bottom: 20px;">Hello,</p>
    
    <p style="margin-bottom: 20px;">We received a request to reset your password for your Revathi Enterprises account associated with <strong>${userEmail}</strong>.</p>
    
    <p style="margin-bottom: 25px;">Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                font-size: 16px;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        Reset Password
      </a>
    </div>
    
    <p style="margin-bottom: 15px; font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="background: #e5e7eb; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563;">
      ${resetLink}
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">
        <strong>Note:</strong> This link will expire in 1 hour for security reasons.
      </p>
      <p style="font-size: 13px; color: #9ca3af; margin: 10px 0 0 0;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Revathi Enterprises. All rights reserved.</p>
    <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
  </div>
</body>
</html>
      `.trim();

      // Trigger Contentstack webhook to send email
      const webhookUrl = process.env.RESET_PASSWORD_WEBHOOK_URL;

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            template: emailTemplate,
            to: userEmail,
            subject: "Password Reset - Revathi Enterprises",
          }),
        });

        if (!response.ok) {
          console.error(
            "Webhook response not OK:",
            response.status,
            await response.text()
          );
        }
      } catch (webhookError) {
        // Log webhook error but don't fail the request
        console.error("Failed to trigger email webhook:", webhookError);
      }

      return {
        message: "Password reset email sent successfully",
        email: userEmail,
        resetLink, // Return link for UI display as backup
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
