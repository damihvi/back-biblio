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
      console.log('GET /api/categories called'); // Log para debugging
      
      const categories = await this.categoriesService.findAll();
      console.log(`Found ${categories.length} categories`); // Log para debugging
      
      return categories; // Simplificar respuesta para debugging
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to retrieve categories: ' + error.message);
    }
  }

  @Post('seed')
  async seedCategories() {
    try {
      console.log('Seeding categories...');
      
      const categories = [
        { name: 'Electrónicos', description: 'Productos electrónicos y gadgets' },
        { name: 'Ropa', description: 'Ropa y accesorios' },
        { name: 'Hogar', description: 'Productos para el hogar' },
        { name: 'Deportes', description: 'Artículos deportivos' },
        { name: 'Libros', description: 'Libros y material de lectura' }
      ];

      const createdCategories = [];
      for (const categoryData of categories) {
        const existing = await this.categoriesService.findByName(categoryData.name);
        if (!existing) {
          const created = await this.categoriesService.create(categoryData);
          createdCategories.push(created);
        }
      }

      return {
        message: `Created ${createdCategories.length} categories`,
        categories: createdCategories
      };
    } catch (error) {
      console.error('Error seeding categories:', error);
      throw new InternalServerErrorException('Failed to seed categories: ' + error.message);
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

  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    try {
      const category = await this.categoriesService.toggleActive(id);
      if (!category) {
        throw new NotFoundException(`Category with ID '${id}' not found`);
      }
      return {
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
        data: category
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling category status:', error);
      throw new InternalServerErrorException('Failed to toggle category status');
    }
  }
}
