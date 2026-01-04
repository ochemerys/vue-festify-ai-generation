import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { PurchaseOrder } from './purchase-order.entity'

@Entity({ name: 'suppliers' })
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  name!: string;

  @Column('varchar', { nullable: true })
  contactName?: string;

  @Column('varchar', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: true })
  phone?: string;

  @Column('text', { nullable: true })
  address?: string;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany('PurchaseOrder', (purchaseOrder: PurchaseOrder) => purchaseOrder.supplier)
  purchaseOrders!: PurchaseOrder[];
}