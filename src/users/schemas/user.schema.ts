import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({})
  lastName?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: "user" })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({})
  createdAt: Date;

  @Prop({})
  updatedAt: Date;

  @Prop({})
  createdBy: string;

  @Prop({})
  updatedBy: string;

  @Prop({ default: "Active", enum: ["Active", "InActive"] })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
