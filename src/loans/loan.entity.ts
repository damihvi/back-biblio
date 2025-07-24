import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Book } from '../products/book.entity';
import { User } from '../users/user.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Book, book => book.loans)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column()
  bookId: string;

  @ManyToOne(() => User, user => user.loans)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  returnedDate: Date;

  @Column({ default: false })
  isReturned: boolean;

  @Column({ default: false })
  isOverdue: boolean;

  @Column({ default: 0 })
  renewalCount: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos auxiliares
  isLoanOverdue(): boolean {
    if (this.isReturned) return false;
    return new Date() > this.dueDate;
  }

  updateOverdueStatus(): void {
    this.isOverdue = this.isLoanOverdue();
  }

  renew(extensionDays: number): void {
    if (!this.isReturned && !this.isOverdue) {
      this.renewalCount++;
      const newDueDate = new Date(this.dueDate);
      newDueDate.setDate(newDueDate.getDate() + extensionDays);
      this.dueDate = newDueDate;
    }
  }

  return(): void {
    this.isReturned = true;
    this.returnedDate = new Date();
    this.isOverdue = false;
  }
}
