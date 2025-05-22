-- CreateEnum
CREATE TYPE "CubicleType" AS ENUM ('GENERAL', 'SPECIAL');

-- CreateTable
CREATE TABLE "Cubicle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "type" "CubicleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cubicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cubicle_name_key" ON "Cubicle"("name");
