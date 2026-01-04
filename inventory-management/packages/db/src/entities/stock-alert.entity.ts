import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Product } from './product.entity'

@Entity({ name: 'stock_alerts' })
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  productId!: string;

  @Column()
  alertType!: string; // 'LOW_STOCK', 'OUT_OF_STOCK', etc.

  @Column()
  currentStock!: number;

  @Column()
  threshold!: number;

  @Column({ default: false })
  isResolved!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  resolvedAt?: Date;

  @ManyToOne('Product', (product: Product) => product.stockAlerts)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}