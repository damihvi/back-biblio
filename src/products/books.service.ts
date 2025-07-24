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

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['category'],
      order: { name: 'ASC' }
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepo.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productRepo.findOne({
      where: { id },
      relations: ['category']
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product | null> {
    const categoryId = await this.resolveCategoryId(createProductDto);
    
    if (!categoryId) {
      throw new Error('Category not found');
    }

    const productData = {
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock || 0,
      categoryId,
      imageUrl: createProductDto.imageUrl,
      isActive: true
    };

    const product = this.productRepo.create(productData);
    return this.productRepo.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    const product = await this.findOne(id);
    if (!product) return null;

    // Resolver categoryId si se envió el nombre de la categoría
    if (updateProductDto.category || updateProductDto.categoryId) {
      const categoryId = await this.resolveCategoryId(updateProductDto);
      if (categoryId) {
        updateProductDto.categoryId = categoryId;
      }
      // Remover el campo category del DTO para evitar conflictos
      delete updateProductDto.category;
    }

    if (updateProductDto.name) {
      const slug = updateProductDto.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      Object.assign(updateProductDto, { slug });
    }

    Object.assign(product, updateProductDto);
    return this.productRepo.save(product);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepo.delete(id);
    return result.affected > 0;
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const product = await this.findOne(id);
    if (!product) return null;

    product.stock = Math.max(0, product.stock + quantity);
    return this.productRepo.save(product);
  }

  async toggleActive(id: string): Promise<Product | null> {
    const product = await this.findOne(id);
    if (!product) return null;

    product.isActive = !product.isActive;
    return this.productRepo.save(product);
  }
}
