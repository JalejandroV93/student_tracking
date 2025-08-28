/*
  Warnings:

  - You are about to drop the column `errorDetails` on the `SyncHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Faltas" ADD COLUMN     "acta_descargos" TEXT,
ADD COLUMN     "diagnostico" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3),
ADD COLUMN     "fecha_ultima_edicion" TIMESTAMP(3),
ADD COLUMN     "seccion" TEXT,
ADD COLUMN     "ultimo_editor" TEXT;

-- AlterTable
ALTER TABLE "public"."SyncHistory" DROP COLUMN "errorDetails";

-- CreateIndex
CREATE INDEX "idx_seccion" ON "public"."Faltas"("seccion");
