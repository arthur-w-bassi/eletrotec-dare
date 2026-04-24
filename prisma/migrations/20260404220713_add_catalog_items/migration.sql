-- CreateEnum
CREATE TYPE "catalog_item_type" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "unit_of_measure" AS ENUM ('UN', 'KG', 'L', 'M', 'M2', 'M3', 'CX', 'PCT', 'HR');

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "type" "catalog_item_type" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "cost_price" DECIMAL(12,2),
    "stock_quantity" DECIMAL(12,3),
    "unit" "unit_of_measure",
    "barcode" TEXT,
    "estimated_duration_minutes" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catalog_items_name_idx" ON "catalog_items"("name");

-- CreateIndex
CREATE INDEX "catalog_items_type_idx" ON "catalog_items"("type");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_barcode_key" ON "catalog_items"("barcode");
