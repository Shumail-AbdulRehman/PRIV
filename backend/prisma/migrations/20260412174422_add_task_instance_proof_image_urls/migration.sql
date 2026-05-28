-- AlterTable
ALTER TABLE "TaskInstance" ADD COLUMN     "proofImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
