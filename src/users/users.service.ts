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

    console.log('Creating user with password:', createUserDto.password);
    const hashedPassword = this.hashPassword(createUserDto.password);
    console.log('Generated hash for new user:', hashedPassword);
    
    // Handle role and isActive fields
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'customer', // Default to 'customer' instead of 'user'
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : 
                createUserDto.active !== undefined ? createUserDto.active : true
    };

    // Remove the 'active' field if it exists since the entity uses 'isActive'
    delete (userData as any).active;

    const user = this.userRepo.create(userData);
    const savedUser = await this.userRepo.save(user);
    
    // Return without password
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async validateUser(identifier: string, password: string): Promise<Omit<User, 'password'> | null> {
    try {
      console.log('Validating user with identifier:', identifier);
      console.log('Raw password received:', password);
      
      // Check if identifier is email or username
      const user = await this.userRepo.findOne({ 
        where: [
          { email: identifier },
          { username: identifier }
        ]
      });
      
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('User not found');
        return null;
      }
      
      if (!user.isActive) {
        console.log('User is not active');
        return null;
      }
      
      const hashedPassword = this.hashPassword(password);
      console.log('Generated hash for validation:', hashedPassword);
      console.log('Stored hash in database:', user.password);
      console.log('Password hash match:', user.password === hashedPassword);
      
      if (user.password === hashedPassword) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      console.log('Password does not match');
      return null;
    } catch (error) {
      console.error('Error in validateUser:', error);
      throw error;
    }
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
