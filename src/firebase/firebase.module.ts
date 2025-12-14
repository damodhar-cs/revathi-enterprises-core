import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

/**
 * Firebase Module
 * 
 * Global module that provides Firebase Admin SDK functionality
 * throughout the application. Exports FirebaseService for use
 * in authentication guards and other services.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}

