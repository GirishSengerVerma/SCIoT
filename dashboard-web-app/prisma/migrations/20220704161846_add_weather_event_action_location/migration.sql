/*
  Warnings:

  - Added the required column `location` to the `WeatherEventAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeatherEventAction" ADD COLUMN     "location" "Location" NOT NULL;
