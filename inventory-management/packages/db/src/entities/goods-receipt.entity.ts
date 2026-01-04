import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { PurchaseOrder } from './purchase-order.entity'
import { User } from './user.entity';

@Entity({ name: 'goods_receipts' })
export class GoodsReceipt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  purchaseOrderId!: string;

  @Column('varchar')
  receiptNumber!: string;

  @Column('uuid')
  receivedBy!: string;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  receivedAt!: Date;

  @ManyToOne('PurchaseOrder', (po: PurchaseOrder) => po.goodsReceipts)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder!: PurchaseOrder;

  @ManyToOne('User')
  @JoinColumn({ name: 'receivedBy' })
  receivedByUser!: User;
}