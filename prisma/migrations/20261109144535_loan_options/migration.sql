/*
  Warnings:

  - You are about to drop the column `available` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `maxAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "available",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "maxAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minAmount" DOUBLE PRECISION NOT NULL;
