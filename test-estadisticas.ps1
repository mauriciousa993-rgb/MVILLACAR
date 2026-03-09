# Script de prueba para estadísticas por usuario
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA DE UTILIDADES POR USUARIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Login como admin
Write-Host "[1/3] Haciendo login como admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@compraventa.com","password":"admin123"}'

$token = $loginResponse.token
Write-Host "✓ Token obtenido" -ForegroundColor Green
Write-Host ""

# Paso 2: Obtener estadísticas como admin
Write-Host "[2/3] Obteniendo estadísticas como ADMIN..." -ForegroundColor Yellow
Write-Host "(Debe mostrar totales completos)" -ForegroundColor Gray
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/vehicles/statistics" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Estadísticas obtenidas:" -ForegroundColor Green
    Write-Host "  - Total Vehículos: $($stats.totalVehiculos)" -ForegroundColor White
    Write-Host "  - Vehículos en Stock: $($stats.vehiculosEnStock)" -ForegroundColor White
    Write-Host "  - Valor Inventario: `$$($stats.valorInventario.ToString('N0'))" -ForegroundColor White
    Write-Host "  - Total Gastos: `$$($stats.totalGastos.ToString('N0'))" -ForegroundColor White
    Write-Host "  - Ganancias Estimadas: `$$($stats.gananciasEstimadas.ToString('N0'))" -ForegroundColor White
    Write-Host "  - Ganancias Reales: `$$($stats.gananciasReales.ToString('N0'))" -ForegroundColor White
} catch {
    Write-Host "✗ Error al obtener estadísticas: $_" -ForegroundColor Red
}
Write-Host ""

# Paso 3: Instrucciones para prueba con inversionista
Write-Host "[3/3] Para probar como INVERSIONISTA:" -ForegroundColor Yellow
Write-Host "1. Crea un usuario inversionista desde el admin" -ForegroundColor Gray
Write-Host "2. Agrega ese usuario como inversionista en un vehículo" -ForegroundColor Gray
Write-Host "3. Haz login con ese usuario" -ForegroundColor Gray
Write-Host "4. Ejecuta este script nuevamente" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
