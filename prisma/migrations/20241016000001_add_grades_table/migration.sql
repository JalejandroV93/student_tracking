-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "schoolYearId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grade_code_schoolYearId_key" ON "Grade"("code", "schoolYearId");

-- CreateIndex  
CREATE INDEX "Grade_schoolYearId_idx" ON "Grade"("schoolYearId");

-- CreateIndex
CREATE INDEX "Grade_academicLevel_idx" ON "Grade"("academicLevel");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add gradeId to Estudiantes table
ALTER TABLE "Estudiantes" ADD COLUMN "gradeId" INTEGER;

-- Add gradeId to User table for group directors 
ALTER TABLE "User" ADD COLUMN "gradeId" INTEGER;

-- Create indexes
CREATE INDEX "Estudiantes_gradeId_idx" ON "Estudiantes"("gradeId");
CREATE INDEX "User_gradeId_idx" ON "User"("gradeId");

-- Add foreign keys
ALTER TABLE "Estudiantes" ADD CONSTRAINT "Estudiantes_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;