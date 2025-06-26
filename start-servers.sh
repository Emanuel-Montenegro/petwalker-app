#!/bin/bash

echo "🚀 Iniciando servidores Pet Walker..."

# Matar procesos existentes
pkill -f "next dev" 2>/dev/null
pkill -f "node dist/index.js" 2>/dev/null
sleep 2

echo "📦 Iniciando Backend (Puerto 4000)..."
cd pet-walker-backend && npm run dev &
BACKEND_PID=$!

sleep 5

echo "🌐 Iniciando Frontend (Puerto 3000)..."
cd ../pet-walker-frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servidores iniciados:"
echo "   🔧 Backend:  http://localhost:4000"
echo "   🌐 Frontend: http://localhost:3000"
echo ""
echo "Para detener: Ctrl+C o mata los procesos $BACKEND_PID y $FRONTEND_PID"

# Esperar a que el usuario presione Ctrl+C
wait 