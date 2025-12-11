// base.model.ts
import { Model, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

export abstract class BaseModel<T, D extends Document> {
  protected constructor(protected readonly model: Model<D>) {}

  async create(data: T): Promise<D> {
    const created = new this.model(data);
    return (await created.save()) as D;
  }

  async findOne(filter: FilterQuery<D>): Promise<D | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<D>): Promise<D[]> {
    return this.model.find(filter).exec();
  }

  async updateOne(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>
  ): Promise<D | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  async updateById(id: string, update: UpdateQuery<D>): Promise<D | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteOne(filter: FilterQuery<D>): Promise<{ deletedCount?: number }> {
    return this.model.deleteOne(filter).exec();
  }

  async deleteById(id: string): Promise<{ deletedCount?: number }> {
    return this.model.deleteOne({ _id: id } as any).exec();
  }

  async count(filter: FilterQuery<D>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async findById(id: string): Promise<D | null> {
    return this.model.findById(id).exec();
  }

  async findOneAndUpdate(
    filter: FilterQuery<D>,
    update: UpdateQuery<D>,
    options?: QueryOptions
  ): Promise<D | null> {
    return this.model.findOneAndUpdate(filter, update, options).exec();
  }
}
