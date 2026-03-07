# 🔐 Guía de Despliegue y Seguridad — JAMALI OS
> Pasos para mover el sistema de entorno local a un entorno de producción seguro.

---

## 1. Seguridad de Datos (RLS)
JAMALI OS es estrictamente Multi-tenant. Esto se logra mediante **Policies de PostgreSQL** en Supabase.

### 🛡️ Regla de Oro
Ningún usuario (mesero, admin, cocinero) debe poder leer o escribir una fila que no pertenezca a su `restaurant_id`.

**Ejemplo de Policy (SQL):**
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see orders from their restaurant"
ON orders FOR ALL
TO authenticated
USING (restaurant_id = (select restaurant_id from profiles where id = auth.uid()));
```

## 2. Variables de Entorno (`.env`)
Nunca subas el archivo `.env.local` al repositorio. Asegúrate de configurar estas variables en Vercel o tu hosting:

*   `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Key pública para el cliente.
*   `SUPABASE_SERVICE_ROLE_KEY`: **Solo servidor**. Bypass de RLS.
*   `DATABASE_URL`: URL de conexión directa (usada por `pg`).

## 3. Checklist de Producción
1.  [ ] **SSL Forzado**: Asegurar que toda conexión sea HTTPS.
2.  [ ] **JWT Expiry**: Configurar en Supabase Auth un tiempo de vida de 1 hora para el token de sesión.
3.  [ ] **Backups**: Activar PITR (Point-In-Time Recovery) en Supabase para evitar pérdida de datos por error humano.
4.  [ ] **Rate Limiting**: Configurar límites de peticiones para evitar ataques de denegación de servicio (DDoS).

## 4. Proceso de Despliegue
1.  Ejecutar scripts SQL en la base de datos de producción (migraciones).
2.  Configurar las variables de entorno en el panel del hosting.
3.  Realizar un `build` del proyecto (`npm run build`).
4.  Verificar que los Webhooks (especialmente Wompi para pagos) apunten a la URL de producción.

---
> [!WARNING]
> El uso de la cuenta `service_role` debe estar restringido exclusivamente a las **Server Actions** y nunca exponerse en el código del lado del cliente (`src/app/...`).
