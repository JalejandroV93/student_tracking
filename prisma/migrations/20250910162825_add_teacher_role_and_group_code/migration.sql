-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'TEACHER';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "groupCode" TEXT;
