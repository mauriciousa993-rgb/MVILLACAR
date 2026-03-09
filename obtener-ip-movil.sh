#!/bin/bash
# Script para obtener IP local en macOS/Linux

echo ""
echo "===================================================="
echo "   ACCESO A LA APLICACION DESDE MOVIL"
echo "===================================================="
echo ""

# Obtener IP local (macOS/Linux)
IP=$(ifconfig | grep -E "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$IP" ]; then
  echo "No se pudo obtener la IP. Ejecuta manualmente: ifconfig"
  exit 1
fi

echo "Tu IP local es: $IP"
echo ""
echo "URLS DE ACCESO:"
echo "==============="
echo ""
echo "Frontend:  http://$IP:3000"
echo "Backend:   http://$IP:5000"
echo "API:       http://$IP:5000/api"
echo ""
echo "PASOS A SEGUIR:"
echo "==============="
echo ""
echo "1. Asegúrate de estar en la MISMA red WiFi en tu móvil"
echo "2. Abre el navegador del móvil e ingresa: http://$IP:3000"
echo "3. Si no funciona, verifica que los servidores estén corriendo"
echo ""
echo "SOLUCIONAR PROBLEMAS:"
echo "====================="
echo ""
echo "- Verifica que backend esté corriendo: npm run dev (en carpeta backend)"
echo "- Verifica que frontend esté corriendo: npm run dev (en carpeta frontend)"
echo "- Si usa MongoDB local, inicia: mongod"
echo ""
echo "DOCUMENTACION COMPLETA:"
echo "=======================
echo "Lee el archivo: ACCESO_DESDE_MOVIL.md"
echo ""
