import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FirebaseAuthGuard } from "../auth/guards/firebase-auth.guard";
import { OutputDto } from "src/common/dto/query-result";
import { User } from "./schemas/user.schema";

/**
 * Users Controller
 * 
 * Protected by FirebaseAuthGuard - all endpoints require valid Firebase JWT token
 */
@ApiTags("Users")
@Controller("users")
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 409, description: "User already exists" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get("search")
  @ApiOperation({ summary: "Get all users from Firebase Authentication" })
  @ApiResponse({ status: 200, description: "Users retrieved from Firebase successfully" })
  searchUsers(@Query("search") search?: string) {
    // Fetch users from Firebase Authentication instead of MongoDB
    return this.usersService.findAllFromFirebase(search);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
