import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from './user.entity'
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  orderNumber!: string;

  @Column('varchar')
  customerName!: string;

  @Column('uuid', { nullable: true })
  customerId?: string;

  @Column('varchar', { nullable: true })
  customerEmail?: string;

  @Column('varchar', { nullable: true })
  customerPhone?: string;

  @Column('text', { nullable: true })
  shippingAddress?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status!: OrderStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column('uuid')
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne('User')
  @JoinColumn({ name: 'createdBy' })
  createdByUser!: User;

  @OneToMany('OrderItem', (orderItem: OrderItem) => orderItem.order)
  items!: OrderItem[];
}