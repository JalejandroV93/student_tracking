/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Estudiantes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `Faltas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Estudiantes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Faltas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estudiantes" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Faltas" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_estado" ON "Casos"("estado");

-- CreateIndex
CREATE INDEX "idx_hash_falta" ON "Casos"("hash_falta");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiantes_id_key" ON "Estudiantes"("id");

-- CreateIndex
CREATE INDEX "idx_codigo" ON "Estudiantes"("codigo");

-- CreateIndex
CREATE INDEX "idx_grado" ON "Estudiantes"("grado");

-- CreateIndex
CREATE INDEX "idx_nivel_estudiante" ON "Estudiantes"("nivel");

-- CreateIndex
CREATE UNIQUE INDEX "Faltas_hash_key" ON "Faltas"("hash");

-- CreateIndex
CREATE INDEX "idx_estudiante" ON "Faltas"("id_estudiante");

-- CreateIndex
CREATE INDEX "idx_codigo_estudiante" ON "Faltas"("codigo_estudiante");

-- CreateIndex
CREATE INDEX "idx_tipo_falta" ON "Faltas"("tipo_falta");

-- CreateIndex
CREATE INDEX "idx_numero_falta" ON "Faltas"("numero_falta");

-- CreateIndex
CREATE INDEX "idx_fecha" ON "Faltas"("fecha");

-- CreateIndex
CREATE INDEX "idx_nivel" ON "Faltas"("nivel");

-- CreateIndex
CREATE INDEX "idx_trimestre" ON "Faltas"("trimestre");

-- CreateIndex
CREATE INDEX "idx_attended" ON "Faltas"("attended");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "Faltas"("created_at");
