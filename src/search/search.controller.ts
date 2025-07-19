import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
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
    // Get PostgreSQL stats only (MongoDB analytics temporarily disabled)
    const pgStats = await this.searchService.getStats();
    
    return {
      ...pgStats,
      analytics: {
        totalSearches: 0,
        topQueries: []
      }
    };
  }
}
