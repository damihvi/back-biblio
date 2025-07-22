import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchAnalytics } from './schemas/search-analytics.schema';
import { OrderItemMongo } from './schemas/order-items.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(SearchAnalytics.name, 'analytics')
    private searchAnalyticsModel: Model<SearchAnalytics>,
    @InjectModel(OrderItemMongo.name, 'analytics') 
    private orderItemModel: Model<OrderItemMongo>,
  ) {}

  // Log search query
  async logSearch(query: string, category?: string, resultsCount?: number, userAgent?: string, ip?: string) {
    try {
      const searchLog = new this.searchAnalyticsModel({
        query,
        category,
        resultsCount: resultsCount || 0,
        userAgent,
        ip,
      });
      await searchLog.save();
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  // Store order items in MongoDB
  async storeOrderItems(orderId: string, items: any[]) {
    try {
      const orderItems = items.map(item => ({
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));
      
      await this.orderItemModel.insertMany(orderItems);
    } catch (error) {
      console.error('Error storing order items:', error);
    }
  }

  // Get search statistics
  async getSearchStats() {
    try {
      const totalSearches = await this.searchAnalyticsModel.countDocuments();
      const topQueries = await this.searchAnalyticsModel.aggregate([
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      return { totalSearches, topQueries };
    } catch (error) {
      console.error('Error getting search stats:', error);
      return { totalSearches: 0, topQueries: [] };
    }
  }
}
