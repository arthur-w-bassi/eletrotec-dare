-- CreateTable
CREATE TABLE "payment_conditions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "days_between" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_conditions_name_key" ON "payment_conditions"("name");

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "payment_condition_id" TEXT;

-- CreateIndex
CREATE INDEX "orders_payment_condition_id_idx" ON "orders"("payment_condition_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_condition_id_fkey" FOREIGN KEY ("payment_condition_id") REFERENCES "payment_conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
