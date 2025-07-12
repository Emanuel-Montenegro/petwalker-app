-- AlterTable
ALTER TABLE "PuntoGPS" 
ADD COLUMN "precision" FLOAT,
ADD COLUMN "velocidad" FLOAT,
ADD COLUMN "altitud" FLOAT,
ADD COLUMN "bateria" INTEGER;

-- CreateIndex
CREATE INDEX "PuntoGPS_paseoId_timestamp_idx" ON "PuntoGPS"("paseoId", "timestamp");
CREATE INDEX "PuntoGPS_timestamp_idx" ON "PuntoGPS"("timestamp"); 