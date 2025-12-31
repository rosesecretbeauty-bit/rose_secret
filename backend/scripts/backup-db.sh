#!/bin/bash
# ============================================
# Script de Backup para PostgreSQL
# ============================================
# Compatible con Render, Supabase y otros servicios PostgreSQL
# Uso: ./backup-db.sh [directorio_destino]

set -e  # Salir si hay error

# Configuración
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/rose_secret_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    echo "   Configura DATABASE_URL en tu entorno o archivo .env"
    exit 1
fi

# Verificar que pg_dump esté disponible
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump no está instalado"
    echo "   Instala PostgreSQL client tools:"
    echo "   - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   - macOS: brew install postgresql"
    echo "   - Windows: Instala PostgreSQL desde postgresql.org"
    exit 1
fi

echo "🔄 Iniciando backup de base de datos..."
echo "   Destino: $BACKUP_FILE"

# Extraer componentes de DATABASE_URL si es necesario
# Formato: postgresql://user:password@host:port/database

# Realizar backup
pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>&1

# Verificar que el backup se creó correctamente
if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
    echo "❌ Error: El backup no se creó correctamente"
    exit 1
fi

# Comprimir backup
echo "📦 Comprimiendo backup..."
gzip -f "$BACKUP_FILE"

# Verificar compresión
if [ ! -f "$COMPRESSED_FILE" ]; then
    echo "❌ Error: La compresión falló"
    exit 1
fi

# Obtener tamaño del archivo
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

echo "✅ Backup completado exitosamente"
echo "   Archivo: $COMPRESSED_FILE"
echo "   Tamaño: $FILE_SIZE"
echo "   Timestamp: $TIMESTAMP"

# Limpiar backups antiguos (mantener últimos 7 días)
echo "🧹 Limpiando backups antiguos (más de 7 días)..."
find "$BACKUP_DIR" -name "rose_secret_backup_*.sql.gz" -mtime +7 -delete
echo "   Limpieza completada"

# Listar backups disponibles
echo ""
echo "📋 Backups disponibles:"
ls -lh "$BACKUP_DIR"/rose_secret_backup_*.sql.gz 2>/dev/null | tail -5 || echo "   No hay backups previos"

exit 0

