-- AlterTable
ALTER TABLE "User" ADD COLUMN     "id_phidias" TEXT,
ADD COLUMN     "url_photo" TEXT;

-- CreateIndex
CREATE INDEX "User_id_phidias_idx" ON "User"("id_phidias");
