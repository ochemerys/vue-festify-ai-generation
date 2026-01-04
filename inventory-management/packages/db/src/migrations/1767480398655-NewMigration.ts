import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1767480398655 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);

        // Create suppliers table
        await queryRunner.query(`
            CREATE TABLE "suppliers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "contactName" character varying,
                "email" character varying,
                "phone" character varying,
                "address" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id")
            )
        `);

        // Create products table
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sku" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                "category" character varying NOT NULL,
                "supplier" character varying NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "cost" numeric(10,2),
                "reorderLevel" integer NOT NULL DEFAULT 0,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8f5" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8bf" ON "products" ("sku")
        `);

        // Create inventory_levels table
        await queryRunner.query(`
            CREATE TABLE "inventory_levels" (
                "productId" uuid NOT NULL,
                "currentQuantity" integer NOT NULL DEFAULT 0,
                "reservedQuantity" integer NOT NULL DEFAULT 0,
                "availableQuantity" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8f6" PRIMARY KEY ("productId")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_levels" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create orders table
        await queryRunner.query(`
            CREATE TYPE "orders_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')
        `);
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderNumber" character varying NOT NULL,
                "customerName" character varying NOT NULL,
                "customerEmail" character varying,
                "shippingAddress" text,
                "totalAmount" numeric(10,2) NOT NULL,
                "status" "orders_status_enum" NOT NULL DEFAULT 'PENDING',
                "createdBy" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8f7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "orders" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f7" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create order_items table
        await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderId" uuid NOT NULL,
                "productId" uuid NOT NULL,
                "quantity" integer NOT NULL,
                "unitPrice" numeric(10,2) NOT NULL,
                "subtotal" numeric(10,2) NOT NULL,
                CONSTRAINT "PK_4c88e956195bba85977da21b8f8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "order_items" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f8_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order_items" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f8_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create purchase_orders table
        await queryRunner.query(`
            CREATE TYPE "purchase_orders_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')
        `);
        await queryRunner.query(`
            CREATE TABLE "purchase_orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "poNumber" character varying NOT NULL,
                "supplierId" uuid NOT NULL,
                "totalAmount" numeric(10,2) NOT NULL,
                "status" "purchase_orders_status_enum" NOT NULL DEFAULT 'DRAFT',
                "expectedDeliveryDate" date,
                "actualDeliveryDate" date,
                "createdBy" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8f9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f9_supplier" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f9_user" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create purchase_order_items table
        await queryRunner.query(`
            CREATE TABLE "purchase_order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "purchaseOrderId" uuid NOT NULL,
                "productId" uuid NOT NULL,
                "quantity" integer NOT NULL,
                "unitPrice" numeric(10,2) NOT NULL,
                "subtotal" numeric(10,2) NOT NULL,
                "receivedQuantity" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_4c88e956195bba85977da21b8fa" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fa_po" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fa_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create goods_receipts table
        await queryRunner.query(`
            CREATE TABLE "goods_receipts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "purchaseOrderId" uuid NOT NULL,
                "receiptNumber" character varying NOT NULL,
                "receivedBy" uuid NOT NULL,
                "notes" text,
                "receivedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8fb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "goods_receipts" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fb_po" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "goods_receipts" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fb_user" FOREIGN KEY ("receivedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create inventory_transactions table
        await queryRunner.query(`
            CREATE TYPE "inventory_transactions_type_enum" AS ENUM('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER')
        `);
        await queryRunner.query(`
            CREATE TABLE "inventory_transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productId" uuid NOT NULL,
                "inventoryLevelId" uuid NOT NULL,
                "type" "inventory_transactions_type_enum" NOT NULL,
                "quantity" integer NOT NULL,
                "reason" character varying,
                "createdBy" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8fc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fc_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fc_inventory" FOREIGN KEY ("inventoryLevelId") REFERENCES "inventory_levels"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fc_user" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create stock_alerts table
        await queryRunner.query(`
            CREATE TABLE "stock_alerts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productId" uuid NOT NULL,
                "alertType" character varying NOT NULL,
                "currentStock" integer NOT NULL,
                "threshold" integer NOT NULL,
                "isResolved" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "resolvedAt" TIMESTAMP,
                CONSTRAINT "PK_4c88e956195bba85977da21b8fd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_alerts" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8fd_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "stock_alerts"`);
        await queryRunner.query(`DROP TABLE "inventory_transactions"`);
        await queryRunner.query(`DROP TYPE "inventory_transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "goods_receipts"`);
        await queryRunner.query(`DROP TABLE "purchase_order_items"`);
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
        await queryRunner.query(`DROP TYPE "purchase_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "inventory_levels"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
