-- CreateIndex
CREATE INDEX "Feedback_promptId_idx" ON "Feedback"("promptId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_promptId_createdAt_idx" ON "Feedback"("promptId", "createdAt");

-- CreateIndex
CREATE INDEX "Prompt_authorId_idx" ON "Prompt"("authorId");

-- CreateIndex
CREATE INDEX "Prompt_createdAt_idx" ON "Prompt"("createdAt");

-- CreateIndex
CREATE INDEX "Prompt_isPublic_idx" ON "Prompt"("isPublic");

-- CreateIndex
CREATE INDEX "Prompt_tags_idx" ON "Prompt"("tags");

-- CreateIndex
CREATE INDEX "Prompt_authorId_createdAt_idx" ON "Prompt"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
