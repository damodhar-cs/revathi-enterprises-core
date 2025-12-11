import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../common/repositories/base.repository";
import { User, UserDocument } from "./schemas/user.schema";
import { IUsersRepository } from "./interface/users.repository.interface";
import { USERS_DATABASE } from "../common/constants/app.constants";
import { OutputDto } from "src/common/dto/query-result";

/**
 * Users repository implementing user-specific database operations
 */
@Injectable()
export class UsersRepository
  extends BaseRepository<UserDocument>
  implements IUsersRepository
{
  constructor(
    @InjectModel(User.name, USERS_DATABASE)
    private readonly userModel: Model<UserDocument>
  ) {
    super(userModel);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<OutputDto<User>> {
    try {
      return await this.findAll({ role });
    } catch (error) {
      throw new Error(`Failed to find users by role: ${error.message}`);
    }
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<OutputDto<User>> {
    try {
      return await this.findAll({ isActive: true });
    } catch (error) {
      throw new Error(`Failed to find active users: ${error.message}`);
    }
  }

  /**
   * Find inactive users
   */
  async findInactiveUsers(): Promise<OutputDto<User>> {
    try {
      return await this.findAll({ isActive: false });
    } catch (error) {
      throw new Error(`Failed to find inactive users: ${error.message}`);
    }
  }

  /**
   * Update user status (active/inactive)
   */
  async updateUserStatus(
    id: string,
    isActive: boolean
  ): Promise<UserDocument | null> {
    try {
      return await this.updateById(id, { isActive });
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  /**
   * Find users with pagination and optional search
   */
  async findUsersWithSearch(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const filter: any = {};

      // Role filter
      if (role) {
        filter.role = role;
      }

      // Search filter (firstName, lastName, email)
      if (searchTerm) {
        filter.$or = [
          { firstName: { $regex: searchTerm, $options: "i" } },
          { lastName: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ];
      }

      return await this.findWithPagination(filter, page, limit, {
        createdAt: -1,
      });
    } catch (error) {
      throw new Error(`Failed to find users with search: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
  }> {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            inactiveUsers: {
              $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
            },
            roles: { $push: "$role" },
          },
        },
      ];

      const rolesPipeline = [
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ];

      const [statsResult, rolesResult] = await Promise.all([
        this.aggregate(pipeline),
        this.aggregate(rolesPipeline),
      ]);

      const stats = statsResult[0] || {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
      };

      const usersByRole: Record<string, number> = {};
      rolesResult.forEach((role: any) => {
        usersByRole[role._id] = role.count;
      });

      return {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        usersByRole,
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }
}
