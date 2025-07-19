import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchAnalytics } from './schemas/search-analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(SearchAnalytics.name, 'analytics')
    private searchAnalyticsModel: Model<SearchAnalytics>,
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
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Get search statistics
  async getSearchStats() {
    try {
      const totalSearches = await this.searchAnalyticsModel.countDocuments();
      const topQueries = await this.searchAnalyticsModel.aggregate([
        {
          $group: {
            _id: '$query',
            count: { $sum: 1 },
            avgResults: { $avg: '$resultsCount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalSearches,
        topQueries: topQueries.map(q => ({
          query: q._id,
          count: q.count,
          avgResults: Math.round(q.avgResults || 0)
        }))
      };
    } catch (error) {
      console.error('Error getting search stats:', error);
      return {
        totalSearches: 0,
        topQueries: []
      };
    }
  }
}
