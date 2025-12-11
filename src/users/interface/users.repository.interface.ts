import { OutputDto } from "src/common/dto/query-result";
import { IBaseRepository } from "../../common/repositories/base.repository.interface";
import { User, UserDocument } from "../schemas/user.schema";

/**
 * Interface for users repository defining user-specific operations
 */
export interface IUsersRepository extends IBaseRepository<UserDocument> {
  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<UserDocument | null>;

  /**
   * Find users by role
   */
  findByRole(role: string): Promise<OutputDto<User>>;

  /**
   * Find active users
   */
  findActiveUsers(): Promise<OutputDto<User>>;

  /**
   * Find inactive users
   */
  findInactiveUsers(): Promise<OutputDto<User>>;

  /**
   * Update user status (active/inactive)
   */
  updateUserStatus(id: string, isActive: boolean): Promise<UserDocument | null>;

  /**
   * Find users with pagination and optional search
   */
  findUsersWithSearch(
    searchTerm?: string,
    page?: number,
    limit?: number,
    role?: string
  ): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Get user statistics
   */
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
  }>;
}
