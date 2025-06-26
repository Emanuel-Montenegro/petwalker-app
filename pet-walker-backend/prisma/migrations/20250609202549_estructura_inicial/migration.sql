-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DUENO', 'PASEADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoPaseo" AS ENUM ('PENDIENTE', 'ACEPTADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoCertificado" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoVerificacionDNI" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mascota" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raza" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "sociable" BOOLEAN NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Mascota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paseo" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL DEFAULT '00:00',
    "duracion" INTEGER NOT NULL DEFAULT 30,
    "estado" "EstadoPaseo" NOT NULL DEFAULT 'PENDIENTE',
    "tipoServicio" TEXT NOT NULL DEFAULT 'NORMAL',
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "mascotaId" INTEGER NOT NULL,
    "paseadorId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladoEn" TIMESTAMP(3),
    "canceladoPorRol" "Rol",
    "origenLatitud" DOUBLE PRECISION,
    "origenLongitud" DOUBLE PRECISION,

    CONSTRAINT "Paseo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "id" SERIAL NOT NULL,
    "paseoId" INTEGER NOT NULL,
    "paseadorId" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL DEFAULT 0,
    "comentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificado" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "archivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoCertificado" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "paseoId" INTEGER NOT NULL,
    "duenioId" INTEGER NOT NULL,
    "paseadorId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuntoGPS" (
    "id" SERIAL NOT NULL,
    "paseoId" INTEGER NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuntoGPS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificacionDNI" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipoDocumento" TEXT,
    "numeroDocumento" TEXT,
    "urlFrente" TEXT,
    "urlDorso" TEXT,
    "estado" "EstadoVerificacionDNI" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificacionDNI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_paseoId_key" ON "Calificacion"("paseoId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_paseoId_key" ON "Factura"("paseoId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificacionDNI_usuarioId_key" ON "VerificacionDNI"("usuarioId");

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paseo" ADD CONSTRAINT "Paseo_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paseo" ADD CONSTRAINT "Paseo_paseadorId_fkey" FOREIGN KEY ("paseadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_paseadorId_fkey" FOREIGN KEY ("paseadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_paseoId_fkey" FOREIGN KEY ("paseoId") REFERENCES "Paseo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_paseoId_fkey" FOREIGN KEY ("paseoId") REFERENCES "Paseo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_duenioId_fkey" FOREIGN KEY ("duenioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_paseadorId_fkey" FOREIGN KEY ("paseadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntoGPS" ADD CONSTRAINT "PuntoGPS_paseoId_fkey" FOREIGN KEY ("paseoId") REFERENCES "Paseo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificacionDNI" ADD CONSTRAINT "VerificacionDNI_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
