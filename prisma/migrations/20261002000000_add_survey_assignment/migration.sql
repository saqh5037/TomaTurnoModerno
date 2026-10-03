-- survey-gate: mandatory random satisfaction survey per phlebotomist per day
-- Ships inert: behavior is controlled by SystemState key 'surveyConfig' (enabled=false by default).

-- CreateTable
CREATE TABLE "SurveyAssignment" (
    "id" SERIAL NOT NULL,
    "turnId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "workDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mode" TEXT NOT NULL,
    "refusalReason" TEXT,
    "iframeLoads" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,

    CONSTRAINT "SurveyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyAssignment_turnId_key" ON "SurveyAssignment"("turnId");

-- CreateIndex
CREATE INDEX "SurveyAssignment_userId_workDate_idx" ON "SurveyAssignment"("userId", "workDate");

-- CreateIndex
CREATE INDEX "SurveyAssignment_workDate_idx" ON "SurveyAssignment"("workDate");

-- CreateIndex
CREATE INDEX "SurveyAssignment_status_idx" ON "SurveyAssignment"("status");

-- AddForeignKey
ALTER TABLE "SurveyAssignment" ADD CONSTRAINT "SurveyAssignment_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "TurnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAssignment" ADD CONSTRAINT "SurveyAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

