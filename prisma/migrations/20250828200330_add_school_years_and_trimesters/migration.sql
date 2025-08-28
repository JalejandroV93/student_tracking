-- AlterTable
ALTER TABLE "public"."Faltas" ADD COLUMN     "school_year_id" INTEGER,
ADD COLUMN     "trimestre_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."SchoolYear" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trimestre" (
    "id" SERIAL NOT NULL,
    "schoolYearId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trimestre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYear_name_key" ON "public"."SchoolYear"("name");

-- CreateIndex
CREATE INDEX "idx_school_year_active" ON "public"."SchoolYear"("isActive");

-- CreateIndex
CREATE INDEX "idx_school_year_start" ON "public"."SchoolYear"("startDate");

-- CreateIndex
CREATE INDEX "idx_school_year_end" ON "public"."SchoolYear"("endDate");

-- CreateIndex
CREATE INDEX "idx_trimestre_school_year" ON "public"."Trimestre"("schoolYearId");

-- CreateIndex
CREATE INDEX "idx_trimestre_start" ON "public"."Trimestre"("startDate");

-- CreateIndex
CREATE INDEX "idx_trimestre_end" ON "public"."Trimestre"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Trimestre_schoolYearId_order_key" ON "public"."Trimestre"("schoolYearId", "order");

-- CreateIndex
CREATE INDEX "idx_trimestre_id" ON "public"."Faltas"("trimestre_id");

-- CreateIndex
CREATE INDEX "idx_school_year_id" ON "public"."Faltas"("school_year_id");

-- AddForeignKey
ALTER TABLE "public"."Trimestre" ADD CONSTRAINT "Trimestre_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "public"."SchoolYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
