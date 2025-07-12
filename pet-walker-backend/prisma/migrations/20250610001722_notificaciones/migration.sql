-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT NOT NULL,
    "data" JSONB,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "PuntoGPS" ADD COLUMN "precision" FLOAT,
                      ADD COLUMN "velocidad" FLOAT,
                      ADD COLUMN "altitud" FLOAT,
                      ADD COLUMN "bateria" INTEGER;

-- CreateIndex
CREATE INDEX "PuntoGPS_paseoId_timestamp_idx" ON "PuntoGPS"("paseoId", "timestamp");
CREATE INDEX "PuntoGPS_timestamp_idx" ON "PuntoGPS"("timestamp");
