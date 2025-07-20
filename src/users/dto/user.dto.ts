export interface CreateUserDto {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
  active?: boolean;
  isActive?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}
