/*
  Warnings:

  - You are about to drop the column `acta_descargos` on the `Faltas` table. All the data in the column will be lost.
  - You are about to drop the column `diagnostico` on the `Faltas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Faltas" DROP COLUMN "acta_descargos",
DROP COLUMN "diagnostico",
ADD COLUMN     "id_externo" INTEGER;

-- CreateIndex
CREATE INDEX "idx_id_externo" ON "public"."Faltas"("id_externo");
