-- AlterTable: add basePrice and printSurcharge to order_items for detailed price breakdown
ALTER TABLE "order_items" ADD COLUMN "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "order_items" ADD COLUMN "printSurcharge" DECIMAL(10,2) NOT NULL DEFAULT 0;
