import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { PurchaseOrder } from './purchase-order.entity.js'
import { Product } from './product.entity.js';

@Entity({ name: 'purchase_order_items' })
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  purchaseOrderId!: string;

  @Column('uuid')
  productId!: string;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('int', { default: 0 })
  receivedQuantity!: number;

  @ManyToOne(() => PurchaseOrder, po => po.items)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder!: PurchaseOrder;

  @ManyToOne('Product')
  @JoinColumn({ name: 'productId' })
  product!: Product;
}