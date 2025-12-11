import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { User, UserDocument } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";
import { OutputDto } from "src/common/dto/query-result";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const currentDate = new Date();
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: "system",
      updatedBy: "system",
      status: "Active",
    };

    return await this.usersRepository.create(userData);
  }

  async findAll(): Promise<OutputDto<User>> {
    const usersResult = await this.usersRepository.findAll();

    return {
      count: usersResult?.count,
      items: usersResult?.items?.map((user) => {
        return this.transformUsersResult(user);
      }),
    };
  }

  async searchUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortField?: "firstName" | "email" | "updatedAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (params.sortField) {
      sort[params.sortField] = params.sortOrder === "asc" ? 1 : -1;
    } else {
      sort["updatedAt"] = -1; // Default sort
    }

    // Build filter
    const filter: any = {};

    if (params.role) {
      filter.role = params.role;
    }

    if (params.status) {
      filter.isActive = params.status === "active";
    }

    if (params.search) {
      filter.$or = [
        { firstName: { $regex: params.search, $options: "i" } },
        { lastName: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
      ];
    }

    const result = await this.usersRepository.findWithPagination(
      filter,
      params.page || 1,
      params.limit || 20,
      sort
    );

    return {
      data: result.data.map((user) => {
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private transformUsersResult(user: UserDocument) {
    delete user?.password;
    return user;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.usersRepository.updateById(id, updateUserDto);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.deleteById(id);
    if (!result) {
      throw new NotFoundException("User not found");
    }
  }
}
