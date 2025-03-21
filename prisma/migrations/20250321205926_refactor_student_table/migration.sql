/*
  Warnings:

  - The primary key for the `Estudiantes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[codigo]` on the table `Estudiantes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Faltas" DROP CONSTRAINT "Faltas_id_estudiante_codigo_estudiante_fkey";

-- AlterTable
ALTER TABLE "Estudiantes" DROP CONSTRAINT "Estudiantes_pkey",
ADD CONSTRAINT "Estudiantes_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiantes_codigo_key" ON "Estudiantes"("codigo");

-- AddForeignKey
ALTER TABLE "Faltas" ADD CONSTRAINT "Faltas_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "Estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
