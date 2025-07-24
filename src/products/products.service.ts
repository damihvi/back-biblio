import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Like, Between, DeepPartial } from 'typeorm';
import { Book } from './book.entity';
import { Genre } from '../categories/genre.entity';
import { CreateBookDto, UpdateBookDto, SearchBooksDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  async resolveGenreId(dto: CreateBookDto | UpdateBookDto): Promise<string | null> {
    if (!dto) {
      throw new BadRequestException('DTO is required');
    }

    if (dto.genreId) {
      return dto.genreId;
    }

    if (dto.genre) {
      const genre = await this.genreRepo.findOne({
        where: { name: dto.genre },
      });

      if (!genre) {
        throw new NotFoundException(`Genre not found: ${dto.genre}`);
      }

      return genre.id;
    }

    return null;
  }

  async findAll(searchParams?: SearchBooksDto): Promise<Book[]> {
    try {
      const where: any = {};
      
      if (searchParams) {
        if (searchParams.title) {
          where.title = Like(`%${searchParams.title}%`);
        }
        if (searchParams.author) {
          where.author = Like(`%${searchParams.author}%`);
        }
        if (searchParams.isbn) {
          where.isbn = searchParams.isbn;
        }
        if (searchParams.publishedYearStart && searchParams.publishedYearEnd) {
          where.publishedYear = Between(searchParams.publishedYearStart, searchParams.publishedYearEnd);
        }
        if (searchParams.genreId) {
          where.genreId = searchParams.genreId;
        }
        if (searchParams.categoryId) {
          where.categoryId = searchParams.categoryId;
        }
        if (searchParams.available !== undefined) {
          where.available = searchParams.available;
        }
      }

      return await this.bookRepo.find({
        where,
        relations: ['category', 'genre'],
        order: { title: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(`Error fetching books: ${error.message}`);
    }
  }

  async findByCategory(categoryId: string, onlyAvailable = true): Promise<Book[]> {
    if (!categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    try {
      const where: any = { categoryId };
      if (onlyAvailable) {
        where.available = true;
        where.availableCopies = MoreThan(0);
      }

      return await this.bookRepo.find({
        where,
        relations: ['category', 'genre'],
        order: { title: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(`Error fetching books by category: ${error.message}`);
    }
  }

  async findByGenre(genreId: string, onlyAvailable = true): Promise<Book[]> {
    if (!genreId) {
      throw new BadRequestException('Genre ID is required');
    }

    try {
      const where: any = { genreId };
      if (onlyAvailable) {
        where.available = true;
        where.availableCopies = MoreThan(0);
      }

      return await this.bookRepo.find({
        where,
        relations: ['category', 'genre'],
        order: { title: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(`Error fetching books by genre: ${error.message}`);
    }
  }

  async findAvailable(): Promise<Book[]> {
    try {
      return await this.bookRepo.find({
        where: { 
          available: true, 
          availableCopies: MoreThan(0) 
        },
        relations: ['category', 'genre'],
        order: { title: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(`Error fetching available books: ${error.message}`);
    }
  }

  async updateStock(id: string, quantity: number): Promise<Book> {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Validar que no se puedan restar más copias de las disponibles
    if (quantity < 0 && Math.abs(quantity) > book.availableCopies) {
      throw new BadRequestException(`Cannot remove ${Math.abs(quantity)} copies. Only ${book.availableCopies} available.`);
    }

    book.totalCopies += quantity;
    book.availableCopies += quantity;
    book.updateAvailability();

    try {
      return await this.bookRepo.save(book);
    } catch (error) {
      throw new BadRequestException(`Error updating book stock: ${error.message}`);
    }
  }

  async searchBooks(query: string): Promise<Book[]> {
    try {
      return await this.bookRepo.find({
        where: [
          { title: Like(`%${query}%`) },
          { author: Like(`%${query}%`) },
          { isbn: Like(`%${query}%`) },
          { publisher: Like(`%${query}%`) },
          { deweyCode: Like(`%${query}%`) }
        ],
        relations: ['category', 'genre'],
        order: { title: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(`Error searching books: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Book> {
    if (!id) {
      throw new BadRequestException('Book ID is required');
    }

    const book = await this.bookRepo.findOne({
      where: { id },
      relations: ['category', 'genre'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    if (!createBookDto) {
      throw new BadRequestException('Book data is required');
    }

    try {
      const genreId = await this.resolveGenreId(createBookDto);
      const { genre, ...bookData } = createBookDto;
      
      const bookToCreate: DeepPartial<Book> = {
        ...bookData,
        genreId: genreId || undefined,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.totalCopies,
        available: bookData.totalCopies > 0
      };

      // Crear y guardar el libro en la base de datos
      const book = this.bookRepo.create(bookToCreate);
      return await this.bookRepo.save(book);
    } catch (error) {
      throw new BadRequestException(`Error creating book: ${error.message}`);
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    try {
      const genreId = await this.resolveGenreId(updateBookDto);
      const { genre, ...updates } = updateBookDto;
      
      if (updates.totalCopies !== undefined) {
        const newTotal = Number(updates.totalCopies);
        const difference = newTotal - book.totalCopies;
        book.totalCopies = newTotal;
        book.availableCopies = Math.max(0, book.availableCopies + difference);
      }

      Object.assign(book, {
        ...updates,
        genreId: genreId || book.genreId,
      });

      book.updateAvailability();
      return await this.bookRepo.save(book);
    } catch (error) {
      throw new BadRequestException(`Error updating book: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    try {
      await this.bookRepo.remove(book);
    } catch (error) {
      throw new BadRequestException(`Error deleting book: ${error.message}`);
    }
  }
}