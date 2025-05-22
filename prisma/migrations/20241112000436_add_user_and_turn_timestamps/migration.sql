-- AlterTable
ALTER TABLE "TurnRequest" ADD COLUMN     "attendedAt" TIMESTAMP(3),
ADD COLUMN     "attendedBy" INTEGER,
ADD COLUMN     "calledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "TurnRequest" ADD CONSTRAINT "TurnRequest_attendedBy_fkey" FOREIGN KEY ("attendedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
