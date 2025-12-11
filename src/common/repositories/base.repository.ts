import {
  Document,
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import { Injectable } from "@nestjs/common";
import { IBaseRepository } from "./base.repository.interface";
import { OutputDto } from "../dto/query-result";

/**
 * Abstract base repository implementing common database operations
 * All specific repositories should extend this class
 */
@Injectable()
export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  protected constructor(protected readonly model: Model<T>) {}

  /**
   * Create a new document
   */
  async create(createDto: Partial<T>): Promise<T> {
    try {
      const currentDate = new Date();
      const createdDocument = new this.model({
        ...createDto,
        isDeleted: false,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
      return await createdDocument.save();
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  /**
   * Create multiple documents
   */
  async createMany(createDtos: Partial<T>[]): Promise<T[]> {
    try {
      const result = await this.model.insertMany(createDtos);
      return result as unknown as T[];
    } catch (error) {
      throw new Error(`Failed to create documents: ${error.message}`);
    }
  }

  /**
   * Find a single document by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new Error(`Failed to find document by ID: ${error.message}`);
    }
  }

  /**
   * Find a single document by filter
   */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      throw new Error(`Failed to find document: ${error.message}`);
    }
  }

  /**
   * Find multiple documents with optional filtering, sorting, and pagination
   */
  async findAll(
    filter: FilterQuery<T> = {},
    options: QueryOptions<T> = {}
  ): Promise<OutputDto<T>> {
    try {
      const documents = await this.model.find(filter, null, options).exec();
      const count = await this.model.countDocuments(filter).exec();
      return {
        count,
        items: documents,
      };
    } catch (error) {
      throw new Error(`Failed to find documents: ${error.message}`);
    }
  }

  /**
   * Find documents with pagination
   */
  async findWithPagination(
    filter: FilterQuery<T>,
    page: number = 1,
    limit: number = 10,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new Error(
        `Failed to find documents with pagination: ${error.message}`
      );
    }
  }

  /**
   * Update a single document by ID
   */
  async updateById(
    id: string,
    updateDto: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true }
  ): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, updateDto, options).exec();
    } catch (error) {
      throw new Error(`Failed to update document by ID: ${error.message}`);
    }
  }

  /**
   * Update a single document by filter
   */
  async updateOne(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true }
  ): Promise<T | null> {
    try {
      return await this.model
        .findOneAndUpdate(filter, updateDto, options)
        .exec();
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  /**
   * Update multiple documents
   */
  async updateMany(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    options: any = {}
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    try {
      const result = await this.model
        .updateMany(filter, updateDto, options)
        .exec();
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      throw new Error(`Failed to update documents: ${error.message}`);
    }
  }

  /**
   * Delete a single document by ID
   */
  async deleteById(_id: string): Promise<{ _id: string; notice: string }> {
    try {
      await this.model.updateOne({ _id }, { isDeleted: true }).exec();
      return {
        _id,
        notice: "Variant deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete document by ID: ${error.message}`);
    }
  }

  /**
   * Delete a single document by filter
   */
  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndDelete(filter).exec();
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Delete multiple documents
   */
  async deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount: number }> {
    try {
      const result = await this.model.deleteMany(filter).exec();
      return { deletedCount: result.deletedCount };
    } catch (error) {
      throw new Error(`Failed to delete documents: ${error.message}`);
    }
  }

  /**
   * Count documents matching the filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      throw new Error(`Failed to count documents: ${error.message}`);
    }
  }

  /**
   * Check if a document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).limit(1).exec();
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check document existence: ${error.message}`);
    }
  }

  /**
   * Find documents with text search
   */
  async search(
    searchTerm: string,
    filter: FilterQuery<T> = {},
    options: QueryOptions<T> = {}
  ): Promise<T[]> {
    try {
      const searchFilter = {
        ...filter,
        $text: { $search: searchTerm },
      };
      return await this.model.find(searchFilter, null, options).exec();
    } catch (error) {
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  /**
   * Aggregate pipeline operations
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline).exec();
    } catch (error) {
      throw new Error(`Failed to aggregate documents: ${error.message}`);
    }
  }

  /**
   * Get the underlying Mongoose model
   * Use this method sparingly for complex operations not covered by the base repository
   */
  protected getModel(): Model<T> {
    return this.model;
  }
}
