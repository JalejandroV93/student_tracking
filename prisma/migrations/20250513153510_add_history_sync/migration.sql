-- CreateTable
CREATE TABLE "SyncHistory" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_sync_status" ON "SyncHistory"("status");

-- CreateIndex
CREATE INDEX "idx_sync_started_at" ON "SyncHistory"("startedAt");
