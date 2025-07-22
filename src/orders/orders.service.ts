import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { AnalyticsService } from '../analytics/analytics.service';

export interface CreateOrderDto {
  userId: string;
  total: number;
  status?: string;
  items: {
    productId: string;
    productName?: string;
    quantity: number;
    price?: number;
    subtotal?: number;
  }[];
  customerInfo?: any;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, items, total: requestedTotal, status = 'pending' } = createOrderDto;

    // Crear la orden con ID aleatorio (UUID se genera automáticamente)
    const order = this.orderRepo.create({
      userId,
      status,
      total: 0
    });

    const savedOrder = await this.orderRepo.save(order);
    console.log('Order created with ID:', savedOrder.id);

    // Crear los items y calcular total
    let calculatedTotal = 0;
    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId } });
      if (!product) {
        console.log(`Product not found: ${item.productId}`);
        continue;
      }

      const itemPrice = item.price || parseFloat(product.price.toString());
      const subtotal = item.subtotal || (itemPrice * item.quantity);
      calculatedTotal += subtotal;

      // Actualizar stock del producto
      product.stock -= item.quantity;
      await this.productRepo.save(product);
      console.log(`Updated stock for product ${product.name}: ${product.stock}`);

      // Crear item con ID aleatorio (UUID se genera automáticamente)
      const orderItem = this.orderItemRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        subtotal
      });
      await this.orderItemRepo.save(orderItem);
      console.log('OrderItem created with ID:', orderItem.id);
    }

    // Actualizar total de la orden (usar el calculado o el enviado)
    savedOrder.total = requestedTotal || calculatedTotal;
    const finalOrder = await this.orderRepo.save(savedOrder);
    
    console.log('Final order saved:', {
      id: finalOrder.id,
      total: finalOrder.total,
      status: finalOrder.status
    });

    // Log order items to MongoDB Analytics
    try {
      const mongoItems = items.map(item => ({
        orderId: savedOrder.id,
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        quantity: item.quantity,
        price: item.price || 0,
        subtotal: item.subtotal || 0
      }));
      
      await this.analyticsService.storeOrderItems(savedOrder.id, mongoItems);
      console.log(`🛒 Order items logged to MongoDB: ${items.length} items for order ${savedOrder.id}`);
    } catch (error) {
      console.error('Error logging order items to MongoDB:', error);
    }

    return finalOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product']
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    await this.orderRepo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.orderRepo.delete(id);
  }
}
