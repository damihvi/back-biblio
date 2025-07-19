import {
  Controller, Get, Post, Put, Delete,
  Param, Body, NotFoundException, BadRequestException,
  InternalServerErrorException, Query
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      
      const categories = await this.categoriesService.findAll();
      
      // Aplicar paginación manualmente ya que no está implementada en el servicio
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedCategories = categories.slice(startIndex, endIndex);
      
      return {
        success: true,
        message: 'Categories retrieved successfully',
        data: paginatedCategories,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(categories.length / limitNum),
          totalItems: categories.length,
          itemsPerPage: limitNum
        }
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to retrieve categories');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    try {
      const category = await this.categoriesService.findOne(id);
      if (!category) {
        throw new NotFoundException(`Category with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Category retrieved successfully',
        data: category
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching category:', error);
      throw new InternalServerErrorException('Failed to retrieve category');
    }
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    if (!createCategoryDto.name || createCategoryDto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    try {
      const category = await this.categoriesService.create(createCategoryDto);
      if (!category) {
        throw new InternalServerErrorException('Failed to create category');
      }
      return {
        success: true,
        message: 'Category created successfully',
        data: category
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    if (Object.keys(updateCategoryDto).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    try {
      const category = await this.categoriesService.update(id, updateCategoryDto);
      if (!category) {
        throw new NotFoundException(`Category with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Category updated successfully',
        data: category
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating category:', error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    try {
      const success = await this.categoriesService.delete(id);
      if (!success) {
        throw new NotFoundException(`Category with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting category:', error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
