import { Prop, Schema } from "@nestjs/mongoose";
import { BaseInterface } from "./base.interface";

@Schema({ timestamps: true })
export class BaseSchema implements BaseInterface {
  @Prop()
  uid: string;

  @Prop({ trim: true })
  created_by: string; // Who created this record

  @Prop({ trim: true })
  updated_by: string; // Who updated this record

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}
