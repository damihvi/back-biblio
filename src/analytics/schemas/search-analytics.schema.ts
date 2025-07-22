import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Search Analytics - MongoDB
@Schema({ timestamps: true })
export class SearchAnalytics extends Document {
  @Prop({ required: true })
  query: string;

  @Prop()
  category?: string;

  @Prop({ default: 0 })
  resultsCount: number;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;
}

export const SearchAnalyticsSchema = SchemaFactory.createForClass(SearchAnalytics);
