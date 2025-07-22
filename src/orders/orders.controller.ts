import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.ordersService.create(createOrderDto);
      return {
        success: true,
        message: 'Order created successfully',
        data: order
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error.message || 'Error creating order',
        data: null
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const orders = await this.ordersService.findAll();
      return {
        success: true,
        message: 'Orders retrieved successfully',
        data: orders
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        message: error.message || 'Error fetching orders',
        data: []
      };
    }
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}
