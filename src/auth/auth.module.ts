import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { FirebaseModule } from '../firebase/firebase.module';

/**
 * Authentication Module
 * 
 * Provides Firebase-based authentication functionality:
 * - JWT verification via FirebaseAuthGuard
 * - Password reset and change operations
 * - User profile management
 */
@Module({
  imports: [FirebaseModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [AuthService, FirebaseAuthGuard],
})
export class AuthModule {} 