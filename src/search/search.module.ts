import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SearchAnalytics, SearchAnalyticsSchema } from '../analytics/schemas/search-analytics.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, User, Order]),
    MongooseModule.forFeature([
      { name: SearchAnalytics.name, schema: SearchAnalyticsSchema }
    ], 'analytics'),
    AnalyticsModule
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
