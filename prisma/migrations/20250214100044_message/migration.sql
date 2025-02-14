-- CreateIndex
CREATE INDEX "Message_chatId_userId_idx" ON "Message"("chatId", "userId");
