import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Book } from '../products/book.entity';
import { AnalyticsService } from '../analytics/analytics.service';

export interface CreateOrderDto {
  userId: string;
  total: number;
  status?: string;
  items: {
    bookId: string;
    bookTitle?: string;
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
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
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
      const book = await this.bookRepo.findOne({ where: { id: item.bookId } });
      if (!book) {
        console.log(`Book not found: ${item.bookId}`);
        continue;
      }

      const itemPrice = item.price || 0; // Los libros no tienen precio directamente
      const subtotal = item.subtotal || (itemPrice * item.quantity);
      calculatedTotal += subtotal;

      // Actualizar disponibilidad del libro
      book.available = false; // Marcar como no disponible cuando se agrega a una orden
      await this.bookRepo.save(book);
      console.log(`Updated availability for book ${book.title}: ${book.available ? 'Available' : 'Not Available'}`);

      // Crear item con ID aleatorio (UUID se genera automáticamente)
      const orderItem = this.orderItemRepo.create({
        orderId: savedOrder.id,
        bookId: item.bookId,
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
        bookId: item.bookId,
        bookTitle: item.bookTitle || 'Unknown Book',
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
      relations: ['user', 'items', 'items.book'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.book']
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.book'],
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
