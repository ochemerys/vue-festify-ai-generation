import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { InventoryLevel } from './inventory-level.entity'
import { OrderItem } from './order-item.entity';
import { InventoryTransaction } from './inventory-transaction.entity';
import { StockAlert } from './stock-alert.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  sku!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  category!: string;

  @Column()
  supplier!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ default: 0 })
  reorderLevel!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany('InventoryLevel', (inventoryLevel: InventoryLevel) => inventoryLevel.product)
  inventoryLevels!: InventoryLevel[];

  @OneToMany('OrderItem', (orderItem: OrderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @OneToMany('InventoryTransaction', (transaction: InventoryTransaction) => transaction.product)
  transactions!: InventoryTransaction[];

  @OneToMany('StockAlert', (alert: StockAlert) => alert.product)
  stockAlerts!: StockAlert[];
}