import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  async findAll(): Promise<Genre[]> {
    return this.genreRepo.find();
  }

  async findOne(id: string): Promise<Genre | null> {
    return this.genreRepo.findOne({ where: { id } });
  }

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepo.create({
      ...createGenreDto,
      slug: this.generateSlug(createGenreDto.name),
    });
    return this.genreRepo.save(genre);
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre | null> {
    const genre = await this.findOne(id);
    if (!genre) return null;

    const updates = { ...updateGenreDto };
    if (updates.name) {
      updates['slug'] = this.generateSlug(updates.name);
    }

    Object.assign(genre, updates);
    return this.genreRepo.save(genre);
  }

  async remove(id: string): Promise<void> {
    await this.genreRepo.delete(id);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
