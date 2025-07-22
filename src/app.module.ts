import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { User } from './users/user.entity';
import { Order } from './orders/order.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // PostgreSQL Connection (Neon) - 4 main tables
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ecommerce',
      entities: [Category, Product, User, Order],
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.DATABASE_URL ? { 
        rejectUnauthorized: false
      } : false,
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: true,
    }),
    // MongoDB Connection (Atlas) - 2 collections
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-analytics',
      {
        connectionName: 'analytics',
        retryAttempts: 3,
        retryDelay: 3000,
      }
    ),
    CategoriesModule,
    ProductsModule,
    UsersModule,
    OrdersModule,
    SearchModule,
    AuthModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}