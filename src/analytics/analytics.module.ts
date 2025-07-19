import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { SearchAnalytics, SearchAnalyticsSchema } from './schemas/search-analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchAnalytics.name, schema: SearchAnalyticsSchema }
    ], 'analytics'),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
