import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from './search.service';
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get('books')
  @ApiQuery({ name: 'q', required: false, description: 'Search query for books' })
  @ApiQuery({ name: 'category', required: false, description: 'Category ID to filter books' })
  @ApiResponse({ status: 200, description: 'List of books matching the search criteria' })
  async searchBooks(
    @Query('q') query?: string,
    @Query('category') categoryId?: string,
    @Req() req?: Request
  ) {
    const userAgent = req?.headers['user-agent'];
    const ip = req?.ip || req?.connection?.remoteAddress;
    
    return this.searchService.searchBooks(query, categoryId, userAgent, ip);
  }

  @Get('users')
  @ApiQuery({ name: 'q', required: true, description: 'Search query for users' })
  @ApiResponse({ status: 200, description: 'List of users matching the search criteria' })
  async searchUsers(@Query('q') query: string) {
    return this.searchService.searchUsers(query);
  }

  @Get('dashboard')
  @ApiResponse({ status: 200, description: 'Dashboard statistics including books and users info' })
  async getDashboardStats() {
    return this.searchService.getDashboardStats();
  }
}
