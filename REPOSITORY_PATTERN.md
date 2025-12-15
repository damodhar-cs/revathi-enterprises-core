# Repository Pattern Implementation

This document explains the repository pattern implementation in our NestJS application, providing a clean separation between business logic and data access.

## Architecture Overview

```
├── src/
│   ├── common/
│   │   └── repositories/
│   │       ├── base.repository.interface.ts    # Base repository contract
│   │       ├── base.repository.ts               # Abstract base repository
│   │       └── index.ts
│   └── [module]/
│       ├── repositories/
│       │   ├── [module].repository.interface.ts # Module-specific repository contract
│       │   ├── [module].repository.ts           # Module-specific repository implementation
│       │   └── index.ts
│       ├── [module].service.ts                  # Business logic (uses repository)
│       └── [module].module.ts                   # Module configuration
```

## Key Components

### 1. Base Repository Interface (`IBaseRepository<T>`)

Defines standard CRUD operations available for all repositories:

```typescript
export interface IBaseRepository<T extends Document> {
  // Create operations
  create(createDto: Partial<T>): Promise<T>;
  createMany(createDtos: Partial<T>[]): Promise<T[]>;

  // Read operations
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findAll(filter?: FilterQuery<T>, options?: QueryOptions<T>): Promise<T[]>;
  findWithPagination(...): Promise<PaginatedResult<T>>;

  // Update operations
  updateById(id: string, updateDto: UpdateQuery<T>): Promise<T | null>;
  updateOne(filter: FilterQuery<T>, updateDto: UpdateQuery<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, updateDto: UpdateQuery<T>): Promise<UpdateResult>;

  // Delete operations
  deleteById(id: string): Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<T | null>;
  deleteMany(filter: FilterQuery<T>): Promise<DeleteResult>;

  // Utility operations
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  search(searchTerm: string, filter?: FilterQuery<T>): Promise<T[]>;
  aggregate(pipeline: any[]): Promise<any[]>;
}
```

### 2. Abstract Base Repository (`BaseRepository<T>`)

Provides concrete implementation of all base operations:

````typescript
@Injectable()
export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  protected constructor(protected readonly model: Model<T>) {}

  async create(createDto: Partial<T>): Promise<T> {
    const createdDocument = new this.model(createDto);
    return await createdDocument.save();
  }

  // ... other implementations
}


### 4. Module-Specific Repository Implementation

```typescript
@Injectable()
export class VariantsRepository
  extends BaseRepository<VariantDocument>
  implements IVariantsRepository
{
  constructor(
    @InjectModel(Variant.name)
    private readonly productModel: Model<VariantDocument>
  ) {
    super(productModel);
  }

  async findBySku(imei: string): Promise<VariantDocument | null> {
    return await this.findOne({ imei });
  }

  // ... other implementations
}
````

## Implementation Guide

### Step 1: Create Module Repository Interface

```typescript
// src/[module]/repositories/[module].repository.interface.ts
import { IBaseRepository } from '../../common/repositories';
import { [Module]Document } from '../schemas/[module].schema';

export interface I[Module]Repository extends IBaseRepository<[Module]Document> {
  // Add module-specific method signatures
  findBySpecificField(field: string): Promise<[Module]Document | null>;
}
```

### Step 2: Create Module Repository Implementation

```typescript
// src/[module]/repositories/[module].repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repositories';
import { [Module], [Module]Document } from '../schemas/[module].schema';
import { I[Module]Repository } from './[module].repository.interface';

@Injectable()
export class [Module]Repository
  extends BaseRepository<[Module]Document>
  implements I[Module]Repository {

  constructor(
    @InjectModel([Module].name)
    private readonly [module]Model: Model<[Module]Document>
  ) {
    super([module]Model);
  }

  async findBySpecificField(field: string): Promise<[Module]Document | null> {
    return await this.findOne({ specificField: field });
  }
}
```

### Step 3: Create Repository Index File

```typescript
// src/[module]/repositories/index.ts
export * from "./[module].repository.interface";
export * from "./[module].repository";
```

### Step 4: Update Service to Use Repository

```typescript
// src/[module]/[module].service.ts
import { Injectable } from '@nestjs/common';
import { [Module]Repository } from './repositories';

@Injectable()
export class [Module]Service {
  constructor(private readonly [module]Repository: [Module]Repository) {}

  async create(createDto: Create[Module]Dto): Promise<[Module]Document> {
    return await this.[module]Repository.create(createDto);
  }

  async findAll(): Promise<[Module]Document[]> {
    return await this.[module]Repository.findAll();
  }

  // ... other service methods using repository
}
```

### Step 5: Register Repository in Module

```typescript
// src/[module]/[module].module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { [Module]Service } from './[module].service';
import { [Module]Controller } from './[module].controller';
import { [Module], [Module]Schema } from './schemas/[module].schema';
import { [Module]Repository } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: [Module].name, schema: [Module]Schema }
    ]),
  ],
  controllers: [[Module]Controller],
  providers: [
    [Module]Repository,  // Add repository as provider
    [Module]Service,
  ],
  exports: [
    [Module]Repository,  // Export repository if needed by other modules
    [Module]Service,
  ],
})
export class [Module]Module {}
```

## Benefits

### 1. **Separation of Concerns**

- Business logic stays in services
- Data access logic isolated in repositories
- Clear boundaries between layers

### 2. **Testability**

- Easy to mock repositories for unit testing services
- Repository methods can be tested independently

### 3. **Reusability**

- Common operations available across all repositories
- Consistent API for data access

### 4. **Maintainability**

- Single place to modify data access logic
- Type-safe operations with TypeScript

### 5. **Consistency**

- Standardized error handling
- Consistent method signatures across modules

## Testing Examples

### Unit Testing Services with Mocked Repository

```typescript
// [module].service.spec.ts
describe('[Module]Service', () => {
  let service: [Module]Service;
  let repository: jest.Mocked<[Module]Repository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        [Module]Service,
        {
          provide: [Module]Repository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<[Module]Service>([Module]Service);
    repository = module.get([Module]Repository);
  });

  it('should create a [module]', async () => {
    const createDto = { /* test data */ };
    const expected = { /* expected result */ };

    repository.create.mockResolvedValue(expected);

    const result = await service.create(createDto);

    expect(repository.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(expected);
  });
});
```

### Integration Testing Repository

```typescript
// [module].repository.spec.ts
describe('[Module]Repository', () => {
  let repository: [Module]Repository;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/test'),
        MongooseModule.forFeature([
          { name: [Module].name, schema: [Module]Schema }
        ]),
      ],
      providers: [[Module]Repository],
    }).compile();

    repository = module.get<[Module]Repository>([Module]Repository);
  });

  it('should create and find a [module]', async () => {
    const createData = { /* test data */ };

    const created = await repository.create(createData);
    const found = await repository.findById(created._id);

    expect(found).toBeDefined();
    expect(found.name).toBe(createData.name);
  });
});
```

## Best Practices

### 1. **Error Handling**

- Always wrap database operations in try-catch blocks
- Provide meaningful error messages
- Re-throw domain-specific exceptions when necessary

### 2. **Type Safety**

- Use proper TypeScript types for all parameters and return values
- Extend Document interface for Mongoose models
- Define clear interfaces for repository contracts

### 3. **Performance**

- Use appropriate indexes for frequently queried fields
- Implement pagination for large data sets
- Use aggregation pipelines for complex queries

### 4. **Validation**

- Validate input parameters in repository methods when necessary
- Use Mongoose schema validation as the first line of defense
- Add business rule validation in service layer

### 5. **Documentation**

- Document complex queries and aggregation pipelines
- Add JSDoc comments for all public methods
- Maintain clear README files for each module

## Migration from Direct Model Usage

To migrate existing code from direct Mongoose model usage to repository pattern:

1. **Create repository interface and implementation**
2. **Register repository in module providers**
3. **Update service constructor to inject repository**
4. **Replace direct model calls with repository methods**
5. **Update tests to mock repository instead of model**

Example migration:

```typescript
// Before (Direct model usage)
@Injectable()
export class VariantsService {
  constructor(
    @InjectModel(Variant.name)
    private productModel: Model<VariantDocument>
  ) {}

  async create(dto: CreateVariantDto): Promise<Variant> {
    const variant = new this.productModel(dto);
    return await variant.save();
  }
}

// After (Repository pattern)
@Injectable()
export class VariantsService {
  constructor(private readonly variantsRepository: VariantsRepository) {}

  async create(dto: CreateVariantDto): Promise<VariantDocument> {
    return await this.variantsRepository.create(dto);
  }
}
```

This repository pattern provides a solid foundation for scalable, maintainable, and testable data access in your NestJS application.
