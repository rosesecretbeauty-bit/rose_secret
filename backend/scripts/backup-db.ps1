# ============================================
# Script de Backup para PostgreSQL (PowerShell)
# ============================================
# Para Windows - Compatible con Render, Supabase y otros servicios PostgreSQL
# Uso: .\backup-db.ps1 [directorio_destino]

param(
    [string]$BackupDir = ".\backups"
)

$ErrorActionPreference = "Stop"

# Configuración
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "rose_secret_backup_$Timestamp.sql"
$CompressedFile = "$BackupFile.gz"

# Crear directorio de backups si no existe
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Verificar que DATABASE_URL esté configurada
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL no está configurada" -ForegroundColor Red
    Write-Host "   Configura DATABASE_URL en tu entorno o archivo .env"
    exit 1
}

# Verificar que pg_dump esté disponible
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpPath) {
    Write-Host "❌ Error: pg_dump no está instalado" -ForegroundColor Red
    Write-Host "   Instala PostgreSQL client tools desde postgresql.org"
    exit 1
}

Write-Host "🔄 Iniciando backup de base de datos..." -ForegroundColor Cyan
Write-Host "   Destino: $BackupFile"

# Realizar backup
try {
    & pg_dump $env:DATABASE_URL | Out-File -FilePath $BackupFile -Encoding UTF8
} catch {
    Write-Host "❌ Error al crear backup: $_" -ForegroundColor Red
    exit 1
}

# Verificar que el backup se creó correctamente
if (-not (Test-Path $BackupFile) -or (Get-Item $BackupFile).Length -eq 0) {
    Write-Host "❌ Error: El backup no se creó correctamente" -ForegroundColor Red
    exit 1
}

# Comprimir backup (requiere 7-Zip o similar)
Write-Host "📦 Comprimiendo backup..." -ForegroundColor Cyan
try {
    # Usar Compress-Archive (nativo de PowerShell)
    Compress-Archive -Path $BackupFile -DestinationPath "$BackupFile.zip" -Force
    Remove-Item $BackupFile
    $CompressedFile = "$BackupFile.zip"
} catch {
    Write-Host "⚠️  Advertencia: No se pudo comprimir el backup" -ForegroundColor Yellow
    $CompressedFile = $BackupFile
}

# Obtener tamaño del archivo
$FileSize = (Get-Item $CompressedFile).Length / 1MB
$FileSizeFormatted = "{0:N2} MB" -f $FileSize

Write-Host "✅ Backup completado exitosamente" -ForegroundColor Green
Write-Host "   Archivo: $CompressedFile"
Write-Host "   Tamaño: $FileSizeFormatted"
Write-Host "   Timestamp: $Timestamp"

# Limpiar backups antiguos (mantener últimos 7 días)
Write-Host "🧹 Limpiando backups antiguos (más de 7 días)..." -ForegroundColor Cyan
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "rose_secret_backup_*.sql*" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
$OldBackups | Remove-Item -Force
Write-Host "   Limpieza completada" -ForegroundColor Green

# Listar backups disponibles
Write-Host ""
Write-Host "📋 Backups disponibles:" -ForegroundColor Cyan
Get-ChildItem -Path $BackupDir -Filter "rose_secret_backup_*.sql*" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 5 | 
    Format-Table Name, Length, LastWriteTime -AutoSize

exit 0

