-- CreateTable
CREATE TABLE "public"."PhidiasSeguimiento" (
    "id" SERIAL NOT NULL,
    "phidias_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tipo_falta" TEXT NOT NULL,
    "nivel_academico" TEXT NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhidiasSeguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhidiasSyncLog" (
    "id" SERIAL NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "studentsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "triggeredBy" TEXT,

    CONSTRAINT "PhidiasSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhidiasSeguimiento_phidias_id_key" ON "public"."PhidiasSeguimiento"("phidias_id");

-- CreateIndex
CREATE INDEX "idx_phidias_seguimiento_id" ON "public"."PhidiasSeguimiento"("phidias_id");

-- CreateIndex
CREATE INDEX "idx_phidias_seguimiento_tipo" ON "public"."PhidiasSeguimiento"("tipo_falta");

-- CreateIndex
CREATE INDEX "idx_phidias_seguimiento_nivel" ON "public"."PhidiasSeguimiento"("nivel_academico");

-- CreateIndex
CREATE INDEX "idx_phidias_seguimiento_school_year" ON "public"."PhidiasSeguimiento"("school_year_id");

-- CreateIndex
CREATE INDEX "idx_phidias_seguimiento_active" ON "public"."PhidiasSeguimiento"("isActive");

-- CreateIndex
CREATE INDEX "idx_phidias_sync_log_status" ON "public"."PhidiasSyncLog"("status");

-- CreateIndex
CREATE INDEX "idx_phidias_sync_log_started" ON "public"."PhidiasSyncLog"("startedAt");

-- CreateIndex
CREATE INDEX "idx_phidias_sync_log_type" ON "public"."PhidiasSyncLog"("syncType");

-- AddForeignKey
ALTER TABLE "public"."PhidiasSeguimiento" ADD CONSTRAINT "PhidiasSeguimiento_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "public"."SchoolYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
