/*
  Warnings:

  - Added the required column `estadoVacunacion` to the `Mascota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observaciones` to the `Mascota` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mascota" ADD COLUMN     "alergias" TEXT[],
ADD COLUMN     "discapacidades" TEXT[],
ADD COLUMN     "estadoVacunacion" TEXT NOT NULL DEFAULT 'Desconocido',
ADD COLUMN     "foto" TEXT,
ADD COLUMN     "necesitaBozal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "observaciones" TEXT NOT NULL DEFAULT '';
