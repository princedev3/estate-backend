-- CreateTable
CREATE TABLE "SavedPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
