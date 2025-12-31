# Tests de Integración - Rose Secret Backend

## 📋 Configuración Requerida

### 1. Base de Datos

Los tests necesitan una base de datos MySQL configurada. Puedes:

**Opción A: Usar base de datos existente (desarrollo)**
- Los tests usan automáticamente la base de datos configurada en `.env`
- Asegúrate de tener `DB_NAME` en tu archivo `.env`

**Opción B: Crear base de datos de test separada (recomendado para producción)**
```sql
CREATE DATABASE rose_secret_test;
```

Luego en `.env` o `.env.test`:
```
DB_NAME=rose_secret_test
```

### 2. Variables de Entorno

Crea un archivo `.env` en `backend/` con:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=rose_secret  # o rose_secret_test
JWT_SECRET=tu_secret_jwt
```

## 🚀 Ejecutar Tests

```bash
# Desde el directorio backend/
npm test              # Todos los tests con coverage
npm test -- --watch   # Modo watch
npm test -- auth      # Solo tests de auth
npm test -- orders    # Solo tests de órdenes
npm test -- payments  # Solo tests de pagos
```

## 📝 Notas Importantes

1. **Los tests modifican la base de datos**: Los tests crean y eliminan datos de prueba.
   - En desarrollo: Se recomienda usar la misma BD pero los tests limpian después.
   - En CI/CD: Usar una BD de test separada.

2. **Mocks configurados**:
   - Stripe está mockeado (no requiere API keys reales)
   - Rate limiting está deshabilitado en tests
   - Email service está mockeado

3. **Cleanup automático**: Los tests limpian datos después de ejecutarse, pero si un test falla antes del `afterAll`, puede quedar basura. Ejecuta manualmente:
   ```sql
   DELETE FROM users WHERE email LIKE '%test%';
   DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
   ```

## ⚠️ Problemas Conocidos

Si ves el error "Unknown database 'rose_secret_test'":
- Verifica que la BD existe o configurar `DB_NAME` en `.env` para usar la BD existente
- El setup automático ahora usa la BD configurada en `.env` si no hay una de test

## 📊 Cobertura

Los tests cubren:
- ✅ Autenticación (8 tests)
- ✅ Órdenes (7 tests)
- ✅ Pagos (6 tests)
- ✅ Validaciones de negocio (8 tests)

**Total: 29 tests de integración**

