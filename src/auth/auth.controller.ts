import { Controller, Post, Body, Get, Patch, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Simple auth guard to check if user is authenticated
export class AuthGuard {
  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token && token.startsWith('simple-token-')) {
      const userId = token.replace('simple-token-', '');
      request.user = { id: parseInt(userId) };
      return true;
    }
    return false;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.usersService.validateUser(loginDto.identifier, loginDto.password);
      if (!user) {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }
      
      return {
        success: true,
        data: {
          token: 'simple-token-' + user.id,
          user: user
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password
    });

    return {
      success: true,
      data: {
        token: 'simple-token-' + user.id,
        user: user
      }
    };
  }

  @Get('debug-hash')
  async debugHash(@Body() body: { password: string }) {
    const password = body.password;
    const hash = Buffer.from(password + 'simple-salt').toString('base64');
    return { password, hash };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      data: { user }
    };
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateProfile(req.user.id, updateData);
    
    return {
      success: true,
      data: { 
        user: updatedUser,
        message: 'Perfil actualizado correctamente'
      }
    };
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const result = await this.usersService.changePassword(
      req.user.id, 
      changePasswordDto.currentPassword, 
      changePasswordDto.newPassword
    );
    
    if (!result) {
      throw new Error('Contraseña actual incorrecta');
    }

    return {
      success: true,
      message: 'Contraseña cambiada correctamente'
    };
  }
}
