import { Document, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import { OutputDto } from "../dto/query-result";

/**
 * Base repository interface defining common database operations
 */
export interface IBaseRepository<T extends Document> {
  /**
   * Create a new document
   */
  create(createDto: Partial<T>): Promise<T>;

  /**
   * Create multiple documents
   */
  createMany(createDtos: Partial<T>[]): Promise<T[]>;

  /**
   * Find a single document by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find a single document by filter
   */
  findOne(filter: FilterQuery<T>): Promise<T | null>;

  /**
   * Find multiple documents with optional filtering, sorting, and pagination
   */
  findAll(
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Promise<OutputDto<T>>;

  /**
   * Find documents with pagination
   */
  findWithPagination(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort?: Record<string, 1 | -1>
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Update a single document by ID
   */
  updateById(
    id: string,
    updateDto: UpdateQuery<T>,
    options?: QueryOptions<T>
  ): Promise<T | null>;

  /**
   * Update a single document by filter
   */
  updateOne(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    options?: QueryOptions<T>
  ): Promise<T | null>;

  /**
   * Update multiple documents
   */
  updateMany(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    options?: any
  ): Promise<{ matchedCount: number; modifiedCount: number }>;

  /**
   * Delete a single document by ID
   */
  deleteById(id: string): Promise<{ _id: string; notice: string }>;

  /**
   * Delete a single document by filter
   */
  deleteOne(filter: FilterQuery<T>): Promise<T | null>;

  /**
   * Delete multiple documents
   */
  deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount: number }>;

  /**
   * Count documents matching the filter
   */
  count(filter?: FilterQuery<T>): Promise<number>;

  /**
   * Check if a document exists
   */
  exists(filter: FilterQuery<T>): Promise<boolean>;

  /**
   * Find documents with text search
   */
  search(
    searchTerm: string,
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Promise<T[]>;

  /**
   * Aggregate pipeline operations
   */
  aggregate(pipeline: any[]): Promise<any[]>;
}
