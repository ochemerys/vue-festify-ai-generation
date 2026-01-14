import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Order } from './order.entity.js'
import { Product } from './product.entity.js';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  orderId!: string;

  @Column('uuid')
  productId!: string;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne('Order', (order: Order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @ManyToOne('Product', (product: Product) => product.orderItems)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}