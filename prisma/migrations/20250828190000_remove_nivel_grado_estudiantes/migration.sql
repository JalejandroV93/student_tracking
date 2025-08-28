-- AlterTable
ALTER TABLE "Estudiantes" DROP COLUMN "grado";
ALTER TABLE "Estudiantes" DROP COLUMN "nivel";

-- Drop indexes for removed columns
DROP INDEX IF EXISTS "idx_grado";
DROP INDEX IF EXISTS "idx_nivel_estudiante";
