/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `TaskTemplate` will be added. If there are existing duplicate values, this will fail.
  - The required column `qrToken` was added to the `TaskTemplate` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "qrToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplate_qrToken_key" ON "TaskTemplate"("qrToken");
