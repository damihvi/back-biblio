import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Book } from '../products/book.entity';
import { IsString, MaxLength, IsOptional } from 'class-validator';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsString()
  @MaxLength(100)
  name: string;

  @Column({ nullable: true, type: 'text' })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Book, book => book.category)
  books: Book[];
}