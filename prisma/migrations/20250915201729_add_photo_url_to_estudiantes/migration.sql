/*
  Warnings:

  - A unique constraint covering the columns `[phidias_id]` on the table `SchoolYear` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Estudiantes" ADD COLUMN     "firstname" TEXT,
ADD COLUMN     "grado" TEXT,
ADD COLUMN     "lastname" TEXT,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "school_year_id" INTEGER,
ADD COLUMN     "seccion" TEXT;

-- AlterTable
ALTER TABLE "public"."SchoolYear" ADD COLUMN     "phidias_id" INTEGER;

-- CreateIndex
CREATE INDEX "idx_estudiantes_school_year_id" ON "public"."Estudiantes"("school_year_id");

-- CreateIndex
CREATE INDEX "idx_estudiantes_grado" ON "public"."Estudiantes"("grado");

-- CreateIndex
CREATE INDEX "idx_estudiantes_seccion" ON "public"."Estudiantes"("seccion");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYear_phidias_id_key" ON "public"."SchoolYear"("phidias_id");

-- CreateIndex
CREATE INDEX "idx_school_year_phidias_id" ON "public"."SchoolYear"("phidias_id");

-- AddForeignKey
ALTER TABLE "public"."Estudiantes" ADD CONSTRAINT "Estudiantes_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "public"."SchoolYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
