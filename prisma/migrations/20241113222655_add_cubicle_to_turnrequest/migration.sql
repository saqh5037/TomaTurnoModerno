-- AlterTable
ALTER TABLE "TurnRequest" ADD COLUMN     "cubicleId" INTEGER;

-- AddForeignKey
ALTER TABLE "TurnRequest" ADD CONSTRAINT "TurnRequest_cubicleId_fkey" FOREIGN KEY ("cubicleId") REFERENCES "Cubicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
