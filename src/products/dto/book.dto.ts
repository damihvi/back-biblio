import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsISBN, Min, IsUrl, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISBN()
  isbn: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  publishedYear?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalCopies: number;

  @IsString()
  @IsOptional()
  language?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pages?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  deweyCode?: string;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  genreId?: string;

  @IsString()
  @IsOptional()
  genre?: string;
}

export class UpdateBookDto implements Partial<CreateBookDto> {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISBN()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  publishedYear?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalCopies?: number;

  @IsString()
  @IsOptional()
  language?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pages?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  deweyCode?: string;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  genreId?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

export class SearchBooksDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  publishedYearStart?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  publishedYearEnd?: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  genreId?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

export class UpdateStockDto {
  @IsNumber()
  @Min(-1000)
  @Type(() => Number)
  quantity: number;
}
