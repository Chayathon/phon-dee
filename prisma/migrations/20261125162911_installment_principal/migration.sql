/*
  Warnings:

  - Added the required column `principal` to the `Installment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Installment" ADD COLUMN     "principal" DOUBLE PRECISION NOT NULL;
