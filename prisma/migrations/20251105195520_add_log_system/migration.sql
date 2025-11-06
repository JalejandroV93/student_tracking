-- AlterTable
ALTER TABLE "public"."Estudiantes" ADD COLUMN     "gradeId" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "gradeId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Grade" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "schoolYearId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Grade_schoolYearId_idx" ON "public"."Grade"("schoolYearId");

-- CreateIndex
CREATE INDEX "Grade_academicLevel_idx" ON "public"."Grade"("academicLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_code_schoolYearId_key" ON "public"."Grade"("code", "schoolYearId");

-- CreateIndex
CREATE INDEX "idx_audit_action" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "idx_audit_user" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "idx_audit_entity_type" ON "public"."AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "idx_audit_created_at" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "idx_audit_status" ON "public"."AuditLog"("status");

-- CreateIndex
CREATE INDEX "idx_audit_username" ON "public"."AuditLog"("username");

-- CreateIndex
CREATE INDEX "idx_estudiantes_gradeId" ON "public"."Estudiantes"("gradeId");

-- CreateIndex
CREATE INDEX "User_gradeId_idx" ON "public"."User"("gradeId");

-- AddForeignKey
ALTER TABLE "public"."Estudiantes" ADD CONSTRAINT "Estudiantes_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grade" ADD CONSTRAINT "Grade_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "public"."SchoolYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
