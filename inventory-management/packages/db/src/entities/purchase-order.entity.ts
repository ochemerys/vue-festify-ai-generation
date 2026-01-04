import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Supplier } from './supplier.entity'
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { GoodsReceipt } from './goods-receipt.entity';
import { User } from './user.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

@Entity({ name: 'purchase_orders' })
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  poNumber!: string;

  @Column('uuid')
  supplierId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT
  })
  status!: PurchaseOrderStatus;

  @Column('timestamp', { nullable: true })
  expectedDate?: Date;

  @Column('timestamp', { nullable: true })
  receivedDate?: Date;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid')
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne('Supplier', (supplier: Supplier) => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier!: Supplier;

  @ManyToOne('User')
  @JoinColumn({ name: 'createdBy' })
  createdByUser!: User;

  @OneToMany('PurchaseOrderItem', (item: PurchaseOrderItem) => item.purchaseOrder)
  items!: PurchaseOrderItem[];

  @OneToMany('GoodsReceipt', (receipt: GoodsReceipt) => receipt.purchaseOrder)
  goodsReceipts!: GoodsReceipt[];
}