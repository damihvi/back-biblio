import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { AnalyticsService } from '../analytics/analytics.service';

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
    private readonly analyticsService: AnalyticsService,
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
      
      // Log search analytics
      await this.analyticsService.logSearch(query, categoryId, results.length, userAgent, ip);
      
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
