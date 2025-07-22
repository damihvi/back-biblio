import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchAnalytics } from '../analytics/schemas/search-analytics.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @Optional() private readonly analyticsService?: AnalyticsService,
    @Optional() @InjectModel(SearchAnalytics.name, 'analytics')
    private readonly searchAnalyticsModel?: Model<SearchAnalytics>,
  ) {}

  async searchProducts(query?: string, categoryId?: string, userAgent?: string, ip?: string): Promise<Product[]> {
    const where: any = { isActive: true };
    let results: Product[] = [];
    
    if (query) {
      results = await this.productRepo.find({
        where: [
          { name: Like(`%${query}%`), isActive: true },
          { description: Like(`%${query}%`), isActive: true }
        ],
        relations: ['category'],
        order: { name: 'ASC' }
      });
      
      // Log search analytics to MongoDB - Multiple approaches
      try {
        const category = results.length > 0 && results[0].category ? results[0].category.name : undefined;
        
        // Try with AnalyticsService first
        if (this.analyticsService) {
          await this.analyticsService.logSearch(query, category, results.length, userAgent, ip);
          console.log(`🔍 Search logged via AnalyticsService: "${query}" found ${results.length} results`);
        } 
        // Fallback to direct MongoDB model
        else if (this.searchAnalyticsModel) {
          const searchLog = new this.searchAnalyticsModel({
            query,
            category,
            resultsCount: results.length || 0,
            userAgent,
            ip,
          });
          await searchLog.save();
          console.log(`🔍 Search logged via direct model: "${query}" found ${results.length} results`);
        } 
        else {
          console.log(`🔍 Search performed: "${query}" found ${results.length} results (analytics unavailable)`);
        }
      } catch (error) {
        console.error('❌ Error logging search:', error.message);
        // Log the search attempt anyway
        console.log(`🔍 Search performed: "${query}" found ${results.length} results (logging failed)`);
      }
      
      return results;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    results = await this.productRepo.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' }
    });

    return results;
  }

  async searchCategories(query?: string): Promise<Category[]> {
    if (!query) {
      return this.categoryRepo.find({
        where: { isActive: true },
        order: { name: 'ASC' }
      });
    }

    return this.categoryRepo.find({
      where: [
        { name: Like(`%${query}%`), isActive: true },
        { description: Like(`%${query}%`), isActive: true }
      ],
      order: { name: 'ASC' }
    });
  }

  async getStats() {
    const [totalProducts, totalCategories, totalUsers, totalOrders] = await Promise.all([
      this.productRepo.count(),
      this.categoryRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { isActive: true } }),
      this.orderRepo.count()
    ]);

    return {
      products: totalProducts,
      categories: totalCategories,
      users: totalUsers,
      orders: totalOrders
    };
  }
}
