import 'reflect-metadata'
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Product } from './product.entity'
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity({ name: 'inventory_levels' })
export class InventoryLevel {
  @PrimaryColumn('uuid')
  productId!: string;

  @Column({ default: 0 })
  currentQuantity!: number;

  @Column({ default: 0 })
  reservedQuantity!: number;

  @Column({ default: 0 })
  availableQuantity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastRestockDate?: Date;

  @ManyToOne('Product', (product: Product) => product.inventoryLevels)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}