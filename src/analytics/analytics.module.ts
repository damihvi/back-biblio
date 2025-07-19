import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([], 'analytics'),
  ],
  providers: [],
  exports: [],
})
export class AnalyticsModule {}
