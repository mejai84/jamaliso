---
description: Ejecutar todas las pruebas (unitarias + E2E) en el proyecto JAMALISO
---
# Run-Tests Workflow

Este workflow te guiará para ejecutar la suite de pruebas del proyecto, asegurando que todos los flujos críticos funcionen antes de un paso a producción.

## 1. Instalar dependencias

Asegúrate de tener todas las dependencias y playwright configurado.

```bash
// turbo
npm ci
```

## 2. Compilar TypeScript (verificación de tipos)

```bash
// turbo
npx tsc --noEmit
```

## 3. Ejecucción de Pruebas Unitarias (Jest)

```bash
// turbo
npm run test
```

## 4. Ejecucción de Pruebas E2E (Playwright)

```bash
// turbo
npm run test:e2e
```

## 5. Reporte E2E

Si se reportan errores o quieres ver cómo se ejecutó el testing visualmente:

```bash
npx playwright show-report
```

> **⚠️ Pre-commit:** Antes de cualquier `git commit`, actualiza `MASTER_README.md` y la documentación indicando explícitamente qué pasó con el test coverage.
