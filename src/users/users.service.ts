import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Hash simple usando btoa (más simple que crypto)
  private hashPassword(password: string): string {
    return Buffer.from(password + 'simple-salt').toString('base64');
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.find({
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'address', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
    return users;
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'address', 'createdAt']
    });
    return user;
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepo.findOne({
      where: { id: id.toString() },
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'address', 'createdAt']
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'> | null> {
    // Check if email exists
    const existingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = this.hashPassword(createUserDto.password);
    
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'user'
    });

    const savedUser = await this.userRepo.save(user);
    
    // Return without password
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async validateUser(identifier: string, password: string): Promise<Omit<User, 'password'> | null> {
    // Check if identifier is email or username
    const user = await this.userRepo.findOne({ 
      where: [
        { email: identifier },
        { username: identifier }
      ]
    });
    
    if (!user || !user.isActive) return null;
    
    const hashedPassword = this.hashPassword(password);
    if (user.password === hashedPassword) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async updateProfile(id: number, updateData: UpdateProfileDto): Promise<Omit<User, 'password'> | null> {
    const userId = id.toString();
    
    // Validate user exists
    const existingUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.userRepo.findOne({ where: { email: updateData.email } });
      if (emailExists) {
        throw new Error('Este email ya está en uso');
      }
    }

    // Update the user
    await this.userRepo.update(userId, updateData);
    
    // Return updated user without password
    return this.findById(id);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const userId = id.toString();
    
    // Find user with password for validation
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Validate current password
    const hashedCurrentPassword = this.hashPassword(currentPassword);
    if (user.password !== hashedCurrentPassword) {
      return false; // Current password is incorrect
    }

    // Hash new password and update
    const hashedNewPassword = this.hashPassword(newPassword);
    await this.userRepo.update(userId, { password: hashedNewPassword });
    
    return true;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepo.delete(id);
    return result.affected > 0;
  }
}
