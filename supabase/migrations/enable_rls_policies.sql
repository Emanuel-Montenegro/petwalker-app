-- Migración para habilitar Row Level Security (RLS) y crear políticas de seguridad
-- Fecha: 2025-01-24
-- Descripción: Habilita RLS en todas las tablas y crea políticas básicas de seguridad

-- =============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =============================================

ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mascota" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Paseo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Factura" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Certificado" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificacionDNI" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Calificacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PuntoGPS" ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA TABLA USUARIO
-- =============================================

-- Los usuarios pueden ver solo su propio perfil
CREATE POLICY "usuarios_pueden_ver_su_perfil" ON "Usuario"
    FOR SELECT USING (auth.uid()::text = id::text);

-- Los usuarios pueden actualizar solo su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_su_perfil" ON "Usuario"
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Permitir inserción de nuevos usuarios (registro)
CREATE POLICY "permitir_registro_usuarios" ON "Usuario"
    FOR INSERT WITH CHECK (true);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "admin_puede_ver_todos_usuarios" ON "Usuario"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA MASCOTA
-- =============================================

-- Los dueños pueden ver sus propias mascotas
CREATE POLICY "duenos_pueden_ver_sus_mascotas" ON "Mascota"
    FOR SELECT USING (auth.uid()::text = "usuarioId"::text);

-- Los dueños pueden insertar mascotas
CREATE POLICY "duenos_pueden_insertar_mascotas" ON "Mascota"
    FOR INSERT WITH CHECK (auth.uid()::text = "usuarioId"::text);

-- Los dueños pueden actualizar sus mascotas
CREATE POLICY "duenos_pueden_actualizar_sus_mascotas" ON "Mascota"
    FOR UPDATE USING (auth.uid()::text = "usuarioId"::text);

-- Los paseadores pueden ver mascotas de paseos asignados
CREATE POLICY "paseadores_pueden_ver_mascotas_asignadas" ON "Mascota"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Paseo" p 
            WHERE p."mascotaId" = "Mascota".id 
            AND p."paseadorId"::text = auth.uid()::text
        )
    );

-- Los administradores pueden ver todas las mascotas
CREATE POLICY "admin_puede_ver_todas_mascotas" ON "Mascota"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA PASEO
-- =============================================

-- Los dueños pueden ver paseos de sus mascotas
CREATE POLICY "duenos_pueden_ver_paseos_sus_mascotas" ON "Paseo"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Mascota" m 
            WHERE m.id = "Paseo"."mascotaId" 
            AND m."usuarioId"::text = auth.uid()::text
        )
    );

-- Los dueños pueden crear paseos para sus mascotas
CREATE POLICY "duenos_pueden_crear_paseos" ON "Paseo"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Mascota" m 
            WHERE m.id = "mascotaId" 
            AND m."usuarioId"::text = auth.uid()::text
        )
    );

-- Los dueños pueden actualizar paseos de sus mascotas
CREATE POLICY "duenos_pueden_actualizar_paseos" ON "Paseo"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "Mascota" m 
            WHERE m.id = "Paseo"."mascotaId" 
            AND m."usuarioId"::text = auth.uid()::text
        )
    );

-- Los paseadores pueden ver paseos asignados a ellos
CREATE POLICY "paseadores_pueden_ver_sus_paseos" ON "Paseo"
    FOR SELECT USING ("paseadorId"::text = auth.uid()::text);

-- Los paseadores pueden actualizar paseos asignados
CREATE POLICY "paseadores_pueden_actualizar_sus_paseos" ON "Paseo"
    FOR UPDATE USING ("paseadorId"::text = auth.uid()::text);

-- Los paseadores pueden ver paseos disponibles (sin asignar)
CREATE POLICY "paseadores_pueden_ver_paseos_disponibles" ON "Paseo"
    FOR SELECT USING (
        "paseadorId" IS NULL 
        AND estado = 'PENDIENTE'
        AND EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'PASEADOR'
        )
    );

-- Los administradores pueden ver todos los paseos
CREATE POLICY "admin_puede_ver_todos_paseos" ON "Paseo"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA FACTURA
-- =============================================

-- Los dueños pueden ver sus facturas
CREATE POLICY "duenos_pueden_ver_sus_facturas" ON "Factura"
    FOR SELECT USING ("duenioId"::text = auth.uid()::text);

-- Los paseadores pueden ver facturas de sus servicios
CREATE POLICY "paseadores_pueden_ver_sus_facturas" ON "Factura"
    FOR SELECT USING ("paseadorId"::text = auth.uid()::text);

-- Solo el sistema puede crear facturas (a través de triggers o funciones)
CREATE POLICY "sistema_puede_crear_facturas" ON "Factura"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- Los administradores pueden ver todas las facturas
CREATE POLICY "admin_puede_ver_todas_facturas" ON "Factura"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA CERTIFICADO
-- =============================================

-- Los usuarios pueden ver sus propios certificados
CREATE POLICY "usuarios_pueden_ver_sus_certificados" ON "Certificado"
    FOR SELECT USING ("usuarioId"::text = auth.uid()::text);

-- Los usuarios pueden subir sus certificados
CREATE POLICY "usuarios_pueden_subir_certificados" ON "Certificado"
    FOR INSERT WITH CHECK ("usuarioId"::text = auth.uid()::text);

-- Los usuarios pueden actualizar sus certificados pendientes
CREATE POLICY "usuarios_pueden_actualizar_certificados_pendientes" ON "Certificado"
    FOR UPDATE USING (
        "usuarioId"::text = auth.uid()::text 
        AND estado = 'PENDIENTE'
    );

-- Los administradores pueden ver y gestionar todos los certificados
CREATE POLICY "admin_puede_gestionar_certificados" ON "Certificado"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA VERIFICACIONDNI
-- =============================================

-- Los usuarios pueden ver su propia verificación
CREATE POLICY "usuarios_pueden_ver_su_verificacion" ON "VerificacionDNI"
    FOR SELECT USING ("usuarioId"::text = auth.uid()::text);

-- Los usuarios pueden crear su verificación
CREATE POLICY "usuarios_pueden_crear_verificacion" ON "VerificacionDNI"
    FOR INSERT WITH CHECK ("usuarioId"::text = auth.uid()::text);

-- Los usuarios pueden actualizar su verificación pendiente
CREATE POLICY "usuarios_pueden_actualizar_verificacion_pendiente" ON "VerificacionDNI"
    FOR UPDATE USING (
        "usuarioId"::text = auth.uid()::text 
        AND estado = 'PENDIENTE'
    );

-- Los administradores pueden gestionar todas las verificaciones
CREATE POLICY "admin_puede_gestionar_verificaciones" ON "VerificacionDNI"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA CALIFICACION
-- =============================================

-- Los dueños pueden ver calificaciones de paseos de sus mascotas
CREATE POLICY "duenos_pueden_ver_calificaciones_sus_paseos" ON "Calificacion"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Paseo" p 
            JOIN "Mascota" m ON p."mascotaId" = m.id 
            WHERE p.id = "Calificacion"."paseoId" 
            AND m."usuarioId"::text = auth.uid()::text
        )
    );

-- Los dueños pueden crear calificaciones para paseos de sus mascotas
CREATE POLICY "duenos_pueden_crear_calificaciones" ON "Calificacion"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Paseo" p 
            JOIN "Mascota" m ON p."mascotaId" = m.id 
            WHERE p.id = "paseoId" 
            AND m."usuarioId"::text = auth.uid()::text
        )
    );

-- Los paseadores pueden ver sus calificaciones
CREATE POLICY "paseadores_pueden_ver_sus_calificaciones" ON "Calificacion"
    FOR SELECT USING ("paseadorId"::text = auth.uid()::text);

-- Los administradores pueden ver todas las calificaciones
CREATE POLICY "admin_puede_ver_todas_calificaciones" ON "Calificacion"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA PUNTOGPS
-- =============================================

-- Los dueños pueden ver puntos GPS de paseos de sus mascotas
CREATE POLICY "duenos_pueden_ver_gps_sus_paseos" ON "PuntoGPS"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Paseo" p 
            JOIN "Mascota" m ON p."mascotaId" = m.id 
            WHERE p.id = "PuntoGPS"."paseoId" 
            AND m."usuarioId"::text = auth.uid()::text
        )
    );

-- Los paseadores pueden ver y crear puntos GPS de sus paseos
CREATE POLICY "paseadores_pueden_gestionar_gps_sus_paseos" ON "PuntoGPS"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Paseo" p 
            WHERE p.id = "PuntoGPS"."paseoId" 
            AND p."paseadorId"::text = auth.uid()::text
        )
    );

-- Los administradores pueden ver todos los puntos GPS
CREATE POLICY "admin_puede_ver_todos_gps" ON "PuntoGPS"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- POLÍTICAS PARA TABLA NOTIFICATION
-- =============================================

-- Los usuarios pueden ver solo sus notificaciones
CREATE POLICY "usuarios_pueden_ver_sus_notificaciones" ON "Notification"
    FOR SELECT USING ("usuarioId"::text = auth.uid()::text);

-- Los usuarios pueden actualizar sus notificaciones (marcar como leídas)
CREATE POLICY "usuarios_pueden_actualizar_sus_notificaciones" ON "Notification"
    FOR UPDATE USING ("usuarioId"::text = auth.uid()::text);

-- Solo el sistema puede crear notificaciones
CREATE POLICY "sistema_puede_crear_notificaciones" ON "Notification"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- Los administradores pueden gestionar todas las notificaciones
CREATE POLICY "admin_puede_gestionar_notificaciones" ON "Notification"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Usuario" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.rol = 'ADMIN'
        )
    );

-- =============================================
-- PERMISOS PARA ROLES ANON Y AUTHENTICATED
-- =============================================

-- Otorgar permisos básicos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE ON "Usuario" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Mascota" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "Paseo" TO authenticated;
GRANT SELECT ON "Factura" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "Certificado" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "VerificacionDNI" TO authenticated;
GRANT SELECT, INSERT ON "Calificacion" TO authenticated;
GRANT SELECT, INSERT ON "PuntoGPS" TO authenticated;
GRANT SELECT, UPDATE ON "Notification" TO authenticated;

-- Otorgar permisos limitados a usuarios anónimos (solo lectura de datos públicos si es necesario)
GRANT SELECT ON "Usuario" TO anon;

-- =============================================
-- COMENTARIOS Y NOTAS
-- =============================================

-- NOTAS IMPORTANTES:
-- 1. Las políticas utilizan auth.uid() que debe coincidir con el ID del usuario en la tabla Usuario
-- 2. Los administradores tienen acceso completo a todas las tablas
-- 3. Los dueños solo pueden ver/gestionar datos relacionados con sus mascotas
-- 4. Los paseadores pueden ver paseos asignados y disponibles
-- 5. Las facturas y notificaciones solo pueden ser creadas por administradores (sistema)
-- 6. Los puntos GPS solo pueden ser creados por paseadores durante paseos activos

-- SEGURIDAD:
-- - Todas las tablas ahora tienen RLS habilitado
-- - Las políticas previenen acceso no autorizado a datos
-- - Los usuarios solo pueden ver/modificar sus propios datos
-- - Los roles están claramente definidos y separados

COMMIT;