# 🤝 Guía del Colaborador (CONTRIBUTING.md)

¡Bienvenido al ecosistema JAMALISO! Para mantener la calidad de nivel industrial, seguimos este protocolo estricto:

## 1. Seguridad de Secretos (Crítico 🚨)
- **NUNCA** subas archivos `.env`, `.env.local` o `.pem`.
- Si expones una clave accidentalmente:
  1. Rotar la clave en el proveedor (Supabase, Resend, etc.).
  2. Usar `git-filter-repo` para purgar el historial.
- Las variables de entorno en producción se gestionan en Vercel/Supabase.

## 2. Flujo de Git y Ramas
- `main`: Rama de producción estable.
- `staging`: Rama de pre-producción (Pruebas con datos reales).
- `feature/[nombre]`: Desarrollo de nuevas funcionalidades.
- `fix/[nombre]`: Corrección de errores.
- **Commit messages:** Usar Conventional Commits (ej. `feat: add split bills`, `fix: kitchen sound delay`).

## 3. Base de Datos y Migraciones
- Las migraciones se encuentran en `/supabase_migrations`.
- **Regla:** Una migración no debe modificarse después de ser aplicada en producción. Si algo falla, crea un nuevo archivo de migración con prefijo numérico correlativo.
- Antes de subir una migración, ejecuta un "dry-run" en local.

## 4. Estándares de Código
- **TypeScript:** Strict mode obligatorio.
- **Estética:** Seguir el estándar Pixora (Blanco inmaculado, espaciado generoso, animaciones fluidas).
- **Documentación:** Si cambias una tabla, actualiza `docs/DATABASE_JAMALISO.md`. Si cambias lógica, actualiza `docs/ARCHITECTURE_JAMALISO.md`.

## 5. Pruebas antes de PR
- `npm run lint` no debe arrojar errores.
- Verificar RLS: Asegura que un restaurante no pueda ver datos de otro.

---
*JAMALISO - Diseñado para dominar la gestión gastronómica.*
