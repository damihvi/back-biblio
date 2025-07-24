import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Genre } from '../categories/genre.entity';
import { Loan } from '../loans/loan.entity';
import { IsString, IsISBN, IsOptional, IsNumber, Min, IsUrl, MaxLength } from 'class-validator';

@Entity('books')
@Index(['title', 'author']) // Índice compuesto para búsquedas por título y autor
@Index(['isbn'], { unique: true }) // Índice único para ISBN
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString()
  @MaxLength(255)
  title: string;

  @Column()
  @IsString()
  @MaxLength(255)
  author: string;

  @Column({ nullable: true, type: 'text' })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ unique: true })
  @IsISBN()
  isbn: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  publisher: string;

  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(1000)
  publishedYear: number;

  @Column({ default: true })
  available: boolean;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  totalCopies: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  availableCopies: number;

  @Column({ nullable: true })
  @IsUrl()
  @IsOptional()
  coverImageUrl: string;

  @Column({ nullable: true, length: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  language: string;

  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(1)
  pages: number;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location: string; // Ubicación física en la biblioteca

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  deweyCode: string; // Código de clasificación Dewey

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  genreId: string;

  @ManyToOne(() => Genre, { eager: true })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  @IsString()
  categoryId: string;

  @OneToMany(() => Loan, loan => loan.book)
  loans: Loan[];

  // Métodos auxiliares
  isAvailable(): boolean {
    return this.available && this.availableCopies > 0;
  }

  updateAvailability(): void {
    this.available = this.availableCopies > 0;
  }

  decrementCopies(): void {
    if (this.availableCopies > 0) {
      this.availableCopies--;
      this.updateAvailability();
    }
  }

  incrementCopies(): void {
    if (this.availableCopies < this.totalCopies) {
      this.availableCopies++;
      this.updateAvailability();
    }
  }

  // Método para validar si se pueden prestar más copias
  canLoan(): boolean {
    return this.isAvailable();
  }

  // Método para validar si se pueden agregar más copias
  canAddCopies(): boolean {
    return this.availableCopies < this.totalCopies;
  }

  // Método para obtener el número de copias prestadas
  getLoanedCopies(): number {
    return this.totalCopies - this.availableCopies;
  }

  // Método para verificar si el libro está completamente prestado
  isFullyLoaned(): boolean {
    return this.availableCopies === 0;
  }

  // Método para validar el estado general del libro
  validateState(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.availableCopies > this.totalCopies) {
      errors.push('Las copias disponibles no pueden ser mayores que el total de copias');
    }

    if (this.totalCopies < 0) {
      errors.push('El total de copias no puede ser negativo');
    }

    if (this.availableCopies < 0) {
      errors.push('Las copias disponibles no pueden ser negativas');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
