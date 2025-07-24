import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Loan } from '../loans/loan.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  maxLoans: number;

  @Column({ default: false })
  hasOverdueLoans: boolean;

  @OneToMany(() => Loan, loan => loan.user)
  loans: Loan[];

  // Método auxiliar para verificar si el usuario puede pedir más libros prestados
  canBorrowBooks(): boolean {
    return this.isActive && !this.hasOverdueLoans && this.loans?.filter(loan => !loan.isReturned).length < this.maxLoans;
  }
}
