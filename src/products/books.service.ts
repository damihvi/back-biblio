import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { Genre } from '../categories/genre.entity';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  private async resolveGenreId(dto: CreateBookDto | UpdateBookDto): Promise<string | null> {
    if (dto.genreId) {
      return dto.genreId;
    }
    
    if (dto.genre) {
      const genre = await this.genreRepo.findOne({
        where: { name: dto.genre }
      });
      return genre?.id || null;
    }
    
    return null;
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepo.find({
      relations: ['category', 'genre'],
      order: { title: 'ASC' }
    });
  }

  async findByCategory(categoryId: string): Promise<Book[]> {
    return this.bookRepo.find({
      where: { categoryId, available: true },
      relations: ['category', 'genre'],
      order: { title: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Book | null> {
    return this.bookRepo.findOne({
      where: { id },
      relations: ['category', 'genre', 'loans']
    });
  }

  async create(createBookDto: CreateBookDto): Promise<Book | null> {
    const genreId = await this.resolveGenreId(createBookDto);
    
    if (!genreId) {
      throw new Error('Genre not found');
    }

    const bookData = {
      title: createBookDto.title,
      author: createBookDto.author,
      description: createBookDto.description,
      isbn: createBookDto.isbn,
      publisher: createBookDto.publisher,
      publishedYear: createBookDto.publishedYear,
      totalCopies: createBookDto.totalCopies || 1,
      availableCopies: createBookDto.totalCopies || 1,
      coverImageUrl: createBookDto.coverImageUrl,
      language: createBookDto.language,
      pages: createBookDto.pages,
      location: createBookDto.location,
      deweyCode: createBookDto.deweyCode,
      genreId,
      categoryId: createBookDto.categoryId,
      available: true
    };

    const book = this.bookRepo.create(bookData);
    return this.bookRepo.save(book);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book | null> {
    const book = await this.findOne(id);
    if (!book) return null;

    if (updateBookDto.genre || updateBookDto.genreId) {
      const genreId = await this.resolveGenreId(updateBookDto);
      if (genreId) {
        updateBookDto.genreId = genreId;
      }
      delete updateBookDto.genre;
    }

    Object.assign(book, updateBookDto);
    return this.bookRepo.save(book);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.bookRepo.delete(id);
    return result.affected > 0;
  }

  async updateCopies(id: string, quantity: number): Promise<Book | null> {
    const book = await this.findOne(id);
    if (!book) return null;

    book.totalCopies = Math.max(0, book.totalCopies + quantity);
    book.availableCopies = Math.max(0, book.availableCopies + quantity);
    book.updateAvailability();
    return this.bookRepo.save(book);
  }

  async toggleAvailability(id: string): Promise<Book | null> {
    const book = await this.findOne(id);
    if (!book) return null;

    book.available = !book.available;
    return this.bookRepo.save(book);
  }
}
