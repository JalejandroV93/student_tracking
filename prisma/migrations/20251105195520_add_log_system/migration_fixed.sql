-- Migración corregida para ser idempotente
-- Esta versión verifica la existencia antes de crear objetos

-- AlterTable Estudiantes - Agregar gradeId solo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Estudiantes' 
        AND column_name = 'gradeId'
    ) THEN
        ALTER TABLE "public"."Estudiantes" ADD COLUMN "gradeId" INTEGER;
    END IF;
END $$;

-- AlterTable User - Agregar gradeId solo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'User' 
        AND column_name = 'gradeId'
    ) THEN
        ALTER TABLE "public"."User" ADD COLUMN "gradeId" INTEGER;
    END IF;
END $$;

-- CreateTable Grade - Solo si no existe
CREATE TABLE IF NOT EXISTS "public"."Grade" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "schoolYearId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog - Solo si no existe
CREATE TABLE IF NOT EXISTS "public"."AuditLog" (
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

-- CreateIndex - Solo si no existe
CREATE INDEX IF NOT EXISTS "Grade_schoolYearId_idx" ON "public"."Grade"("schoolYearId");
CREATE INDEX IF NOT EXISTS "Grade_academicLevel_idx" ON "public"."Grade"("academicLevel");
CREATE UNIQUE INDEX IF NOT EXISTS "Grade_code_schoolYearId_key" ON "public"."Grade"("code", "schoolYearId");

CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "public"."AuditLog"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_user" ON "public"."AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_entity_type" ON "public"."AuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "idx_audit_created_at" ON "public"."AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_audit_status" ON "public"."AuditLog"("status");
CREATE INDEX IF NOT EXISTS "idx_audit_username" ON "public"."AuditLog"("username");

CREATE INDEX IF NOT EXISTS "idx_estudiantes_gradeId" ON "public"."Estudiantes"("gradeId");
CREATE INDEX IF NOT EXISTS "User_gradeId_idx" ON "public"."User"("gradeId");

-- AddForeignKey - Verificar y agregar solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Estudiantes_gradeId_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Estudiantes" 
        ADD CONSTRAINT "Estudiantes_gradeId_fkey" 
        FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_gradeId_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."User" 
        ADD CONSTRAINT "User_gradeId_fkey" 
        FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Grade_schoolYearId_fkey'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."Grade" 
        ADD CONSTRAINT "Grade_schoolYearId_fkey" 
        FOREIGN KEY ("schoolYearId") REFERENCES "public"."SchoolYear"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
