/*
  Warnings:

  - Added the required column `updated_at` to the `Seguimientos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Faltas" ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "observaciones_autor" TEXT,
ADD COLUMN     "observaciones_fecha" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Seguimientos" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT;

-- CreateIndex
CREATE INDEX "idx_seguimiento_caso" ON "public"."Seguimientos"("id_caso");

-- CreateIndex
CREATE INDEX "idx_seguimiento_created_at" ON "public"."Seguimientos"("created_at");

-- CreateIndex
CREATE INDEX "idx_seguimiento_updated_at" ON "public"."Seguimientos"("updated_at");
