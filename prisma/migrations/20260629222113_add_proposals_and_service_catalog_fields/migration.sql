-- CreateEnum
CREATE TYPE "service_category" AS ENUM ('ELECTRICAL', 'HVAC', 'PLUMBING', 'MAINTENANCE', 'INSPECTION');

-- CreateEnum
CREATE TYPE "proposal_status" AS ENUM ('DRAFT', 'COMPLETED');

-- AlterTable
ALTER TABLE "catalog_items" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "service_category" "service_category";

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "proposal_number" SERIAL NOT NULL,
    "status" "proposal_status" NOT NULL DEFAULT 'DRAFT',
    "customer_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "cover_title" TEXT NOT NULL,
    "cover_client" TEXT NOT NULL,
    "cover_client_address" TEXT,
    "cover_client_document" TEXT,
    "cover_client_contact" TEXT,
    "cover_date" TEXT NOT NULL,
    "introduction" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "signature_prepared_by" TEXT NOT NULL DEFAULT '',
    "signature_date" TEXT NOT NULL DEFAULT '',
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "section_order" JSONB,
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_line_items" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "catalog_item_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "images" JSONB NOT NULL DEFAULT '[]',
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "item_total" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "proposal_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_internal_costs" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "proposal_internal_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" "service_category" NOT NULL,
    "introduction" TEXT NOT NULL DEFAULT '',
    "service_ids" JSONB NOT NULL DEFAULT '[]',
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposals_proposal_number_key" ON "proposals"("proposal_number");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "proposals_customer_id_idx" ON "proposals"("customer_id");

-- CreateIndex
CREATE INDEX "proposals_created_at_idx" ON "proposals"("created_at");

-- CreateIndex
CREATE INDEX "proposal_line_items_proposal_id_idx" ON "proposal_line_items"("proposal_id");

-- CreateIndex
CREATE INDEX "proposal_line_items_catalog_item_id_idx" ON "proposal_line_items"("catalog_item_id");

-- CreateIndex
CREATE INDEX "proposal_internal_costs_proposal_id_idx" ON "proposal_internal_costs"("proposal_id");

-- CreateIndex
CREATE INDEX "proposal_templates_category_idx" ON "proposal_templates"("category");

-- CreateIndex
CREATE INDEX "proposal_templates_is_active_idx" ON "proposal_templates"("is_active");

-- CreateIndex
CREATE INDEX "catalog_items_service_category_idx" ON "catalog_items"("service_category");

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_internal_costs" ADD CONSTRAINT "proposal_internal_costs_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
