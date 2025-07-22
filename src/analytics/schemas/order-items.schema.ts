import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Order Items - MongoDB
@Schema({ timestamps: true })
export class OrderItemMongo extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  subtotal: number;
}

export const OrderItemMongoSchema = SchemaFactory.createForClass(OrderItemMongo);
