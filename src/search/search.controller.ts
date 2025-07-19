import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from './search.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly analyticsService: AnalyticsService
  ) {}

  @Get('products')
  async searchProducts(
    @Query('q') query?: string,
    @Query('category') categoryId?: string,
    @Req() req?: Request
  ) {
    const userAgent = req?.headers['user-agent'];
    const ip = req?.ip || req?.connection?.remoteAddress;
    
    return this.searchService.searchProducts(query, categoryId, userAgent, ip);
  }

  @Get('categories')
  async searchCategories(@Query('q') query?: string) {
    return this.searchService.searchCategories(query);
  }

  @Get('stats')
  async getStats() {
    // Get both PostgreSQL stats and MongoDB analytics
    const pgStats = await this.searchService.getStats();
    const mongoStats = await this.analyticsService.getSearchStats();
    
    return {
      ...pgStats,
      analytics: mongoStats
    };
  }
}
