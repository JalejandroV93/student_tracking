-- CreateTable
CREATE TABLE "SyncMetadata" (
    "id" SERIAL NOT NULL,
    "tabla" TEXT NOT NULL,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncMetadata_tabla_key" ON "SyncMetadata"("tabla");
