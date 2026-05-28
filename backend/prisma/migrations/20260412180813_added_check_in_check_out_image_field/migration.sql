/*
  Warnings:

  - Added the required column `checkInImage` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOutImage` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "checkInImage" TEXT NOT NULL,
ADD COLUMN     "checkOutImage" TEXT NOT NULL;
