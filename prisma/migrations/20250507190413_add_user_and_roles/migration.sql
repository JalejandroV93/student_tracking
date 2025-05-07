-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ELEMENTARY_COORDINATOR', 'PRESCHOOL_COORDINATOR', 'MIDDLE_SCHOOL_COORDINATOR', 'HIGH_SCHOOL_COORDINATOR', 'PSYCHOLOGY', 'STUDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phonenumber" TEXT,
    "role" "Role" NOT NULL,
    "password" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_document_key" ON "User"("document");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_document_idx" ON "User"("document");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isBlocked_idx" ON "User"("isBlocked");
