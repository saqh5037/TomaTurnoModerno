-- CreateIndex
CREATE INDEX "TurnRequest_status_idx" ON "public"."TurnRequest"("status");

-- CreateIndex
CREATE INDEX "TurnRequest_isCalled_idx" ON "public"."TurnRequest"("isCalled");

-- CreateIndex
CREATE INDEX "TurnRequest_status_isCalled_idx" ON "public"."TurnRequest"("status", "isCalled");

-- CreateIndex
CREATE INDEX "TurnRequest_attendedBy_idx" ON "public"."TurnRequest"("attendedBy");

-- CreateIndex
CREATE INDEX "TurnRequest_createdAt_idx" ON "public"."TurnRequest"("createdAt");

-- CreateIndex
CREATE INDEX "TurnRequest_finishedAt_idx" ON "public"."TurnRequest"("finishedAt");

-- CreateIndex
CREATE INDEX "TurnRequest_assignedTurn_idx" ON "public"."TurnRequest"("assignedTurn");

-- CreateIndex
CREATE INDEX "TurnRequest_status_assignedTurn_idx" ON "public"."TurnRequest"("status", "assignedTurn");
