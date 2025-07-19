import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// User Sessions - MongoDB
@Schema({ timestamps: true })
export class UserSession extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  lastActivity: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  location: {
    country: string;
    city: string;
  };
}

// Product Analytics - MongoDB
@Schema({ timestamps: true })
export class ProductAnalytics extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  action: string; // 'view', 'click', 'add_to_cart', 'purchase'

  @Prop()
  userId: string;

  @Prop()
  sessionId: string;

  @Prop()
  timestamp: Date;

  @Prop()
  metadata: {
    referrer?: string;
    searchQuery?: string;
    category?: string;
    position?: number;
  };
}

// Search Logs - MongoDB
@Schema({ timestamps: true })
export class SearchLog extends Document {
  @Prop({ required: true })
  query: string;

  @Prop()
  userId: string;

  @Prop()
  sessionId: string;

  @Prop()
  resultsCount: number;

  @Prop()
  filters: {
    category?: string;
    priceRange?: { min: number; max: number };
    sortBy?: string;
  };

  @Prop()
  timestamp: Date;
}

// User Behavior - MongoDB
@Schema({ timestamps: true })
export class UserBehavior extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  action: string; // 'page_view', 'scroll', 'hover', 'click'

  @Prop()
  page: string;

  @Prop()
  element: string;

  @Prop()
  timestamp: Date;

  @Prop()
  duration: number; // Time spent on action
}

// Cart Sessions - MongoDB
@Schema({ timestamps: true })
export class CartSession extends Document {
  @Prop({ required: true })
  sessionId: string;

  @Prop()
  userId: string;

  @Prop()
  items: [{
    productId: string;
    quantity: number;
    price: number;
    addedAt: Date;
  }];

  @Prop()
  totalValue: number;

  @Prop({ default: 'active' })
  status: string; // 'active', 'abandoned', 'converted'

  @Prop()
  lastActivity: Date;
}

// Product Reviews - MongoDB
@Schema({ timestamps: true })
export class ProductReview extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  title: string;

  @Prop()
  comment: string;

  @Prop({ default: true })
  isVerified: boolean;

  @Prop()
  helpfulVotes: number;

  @Prop()
  images: string[];

  @Prop({ default: true })
  isVisible: boolean;
}

// Notifications - MongoDB
@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string; // 'order_status', 'promotion', 'system', 'review_reminder'

  @Prop({ required: true })
  title: string;

  @Prop()
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  actionUrl: string;

  @Prop()
  expiresAt: Date;

  @Prop()
  metadata: any;
}

// Audit Logs - MongoDB
@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  action: string;

  @Prop()
  userId: string;

  @Prop()
  resourceType: string; // 'product', 'user', 'order', 'category'

  @Prop()
  resourceId: string;

  @Prop()
  changes: any;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ required: true })
  timestamp: Date;
}

// Export schemas
export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
export const ProductAnalyticsSchema = SchemaFactory.createForClass(ProductAnalytics);
export const SearchLogSchema = SchemaFactory.createForClass(SearchLog);
export const UserBehaviorSchema = SchemaFactory.createForClass(UserBehavior);
export const CartSessionSchema = SchemaFactory.createForClass(CartSession);
export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview);
export const NotificationSchema = SchemaFactory.createForClass(Notification);
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
