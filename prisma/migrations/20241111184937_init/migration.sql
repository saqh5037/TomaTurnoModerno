-- CreateTable
CREATE TABLE "TurnRequest" (
    "id" SERIAL NOT NULL,
    "patientName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "contactInfo" TEXT,
    "studies" TEXT NOT NULL,
    "tubesRequired" INTEGER NOT NULL,
    "observations" TEXT,
    "clinicalInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedTurn" INTEGER,

    CONSTRAINT "TurnRequest_pkey" PRIMARY KEY ("id")
);
