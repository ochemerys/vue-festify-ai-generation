import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Product } from './product.entity'
import { InventoryLevel } from './inventory-level.entity';
import { User } from './user.entity';

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  TRANSFER = 'TRANSFER'
}

@Entity({ name: 'inventory_transactions' })
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  productId!: string;

  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type!: TransactionType;

  @Column('int')
  quantity!: number;

  @Column('varchar', { nullable: true })
  reference?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne('Product', (product: Product) => product.transactions)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdByUser?: User;
}