/*
  Warnings:

  - You are about to drop the column `latName` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "latName",
ADD COLUMN     "lastName" TEXT;
