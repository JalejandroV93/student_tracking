/*
  Warnings:

  - You are about to drop the column `seccion` on the `Estudiantes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Estudiantes" DROP COLUMN "seccion",
ADD COLUMN     "grado" TEXT;
