import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan])
  ],
  exports: [TypeOrmModule]
})
export class LoansModule {}
