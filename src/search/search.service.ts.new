import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Book } from '../products/book.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchAnalytics } from '../analytics/schemas/search-analytics.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Optional() private readonly analyticsService?: AnalyticsService,
    @Optional() @InjectModel(SearchAnalytics.name)
    private readonly searchAnalyticsModel?: Model<SearchAnalytics>,
  ) {}

  async searchBooks(query?: string, categoryId?: string, userAgent?: string, ip?: string): Promise<Book[]> {
    // Track search query if analytics service is available
    if (query && this.analyticsService) {
      await this.logSearch(query, userAgent, ip);
    }

    let results: Book[] = [];

    if (!query && !categoryId) {
      // Si no hay query ni categoryId, devolver todos los libros disponibles
      results = await this.bookRepo.find({
        where: { available: true },
        relations: ['category', 'genre'],
        order: { title: 'ASC' }
      });
    } else if (categoryId) {
      // Búsqueda por categoría
      const whereClause: any = {
        available: true,
        categoryId
      };

      if (query) {
        whereClause.title = Like(`%${query}%`);
      }

      results = await this.bookRepo.find({
        where: whereClause,
        relations: ['category', 'genre'],
        order: { title: 'ASC' }
      });
    } else if (query) {
      // Búsqueda por título, autor, descripción, ISBN o categoría
      const terms = query.toLowerCase().split(' ');
      const categories = await this.categoryRepo.find();
      const categoryMatches = categories.filter(cat => 
        terms.some(term => cat.name.toLowerCase().includes(term))
      );

      const categoryIds = categoryMatches.map(cat => cat.id);

      results = await this.bookRepo.find({
        where: [
          { title: Like(`%${query}%`), available: true },
          { author: Like(`%${query}%`), available: true },
          { description: Like(`%${query}%`), available: true },
          { isbn: Like(`%${query}%`), available: true },
          ...categoryIds.map(catId => ({ categoryId: catId, available: true }))
        ],
        relations: ['category', 'genre'],
        order: { title: 'ASC' }
      });
    }

    return results;
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.userRepo.find({
      where: [
        { email: Like(`%${query}%`) },
        { username: Like(`%${query}%`) },
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) }
      ],
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive']
    });
  }

  async getDashboardStats() {
    try {
      const [
        totalBooks,
        totalUsers,
        availableBooks,
        recentlyAddedBooks
      ] = await Promise.all([
        this.bookRepo.count(),
        this.userRepo.count(),
        this.bookRepo.count({ where: { available: true } }),
        this.bookRepo.find({
          take: 5,
          order: { createdAt: 'DESC' },
          relations: ['category', 'genre']
        })
      ]);

      return {
        totalBooks,
        totalUsers,
        availableBooks,
        recentlyAddedBooks
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  private async logSearch(query: string, userAgent?: string, ip?: string) {
    if (this.searchAnalyticsModel) {
      try {
        const searchLog = new this.searchAnalyticsModel({
          query,
          timestamp: new Date(),
          userAgent,
          ip
        });
        await searchLog.save();
      } catch (error) {
        console.error('Error logging search:', error);
      }
    }
  }
}
