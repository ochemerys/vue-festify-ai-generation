import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { InventoryLevel } from './inventory-level.entity.js'
import { OrderItem } from './order-item.entity.js';
import { InventoryTransaction } from './inventory-transaction.entity.js';
import { StockAlert } from './stock-alert.entity.js';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { unique: true })
  sku!: string;

  @Column('varchar')
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('varchar')
  category!: string;

  @Column('varchar')
  supplier!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column('int', { default: 0 })
  reorderLevel!: number;

  @Column('boolean', { default: true })
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