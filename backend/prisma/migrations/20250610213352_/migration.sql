/*
  Warnings:

  - You are about to alter the column `entries` on the `users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "entries" SET DATA TYPE INTEGER;
