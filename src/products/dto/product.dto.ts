export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId?: string;
  category?: string; // Permitir enviar nombre de categoría
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  category?: string; // Permitir enviar nombre de categoría
  imageUrl?: string;
  isActive?: boolean;
}
