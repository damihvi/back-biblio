import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GenresModule } from './categories/genres.module';
import { BooksModule } from './products/books.module';
import { UsersModule } from './users/users.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Genre } from './categories/genre.entity';
import { Book } from './products/book.entity';
import { User } from './users/user.entity';
import { Loan } from './loans/loan.entity';
import { LoansModule } from './loans/loans.module';
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
      entities: [Genre, Book, User, 'dist/**/*.entity{.ts,.js}'],
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
    GenresModule,
    BooksModule,
    UsersModule,
    SearchModule,
    AuthModule,
    AnalyticsModule,
    LoansModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}