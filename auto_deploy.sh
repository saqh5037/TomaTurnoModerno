#!/bin/bash

# Script automatizado para ejecutar en el servidor de producción
# Ejecutar este script DESPUÉS de conectarse por SSH al servidor

set -e  # Detener si hay errores

echo "🚀 Iniciando despliegue de Toma-Turno-Moderno..."

# 1. Verificar puerto 3000
echo "📍 Verificando puerto 3000..."
if sudo lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Puerto 3000 en uso. Deteniendo proceso anterior..."
    sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi

# 2. Backup de versión anterior
echo "💾 Creando backup de versión anterior..."
if [ -d "/home/dynamtek/toma-turno-moderno" ]; then
    sudo mv /home/dynamtek/toma-turno-moderno /home/dynamtek/toma-turno-moderno.backup.$(date +%Y%m%d_%H%M%S)
fi

# 3. Clonar repositorio
echo "📦 Descargando versión Produccion250814..."
cd /home/dynamtek
git clone --branch Produccion250814 https://github.com/saqh5037/TomaTurnoModerno.git toma-turno-moderno
cd toma-turno-moderno

# 4. Instalar dependencias
echo "📚 Instalando dependencias..."
npm install

# 5. Configurar variables de entorno
echo "⚙️  Configurando variables de entorno..."
cat > .env.production << 'EOL'
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public"
JWT_SECRET="toma-turno-iner-2024-secret-key"
NODE_ENV="production"
NEXTAUTH_URL="http://192.168.2.190:3000"
PORT=3000
EOL

# 6. Configurar base de datos
echo "🗄️  Configurando base de datos..."
sudo -u postgres psql << EOF
CREATE DATABASE toma_turno;
CREATE USER labsis WITH PASSWORD 'labsis';
GRANT ALL PRIVILEGES ON DATABASE toma_turno TO labsis;
EOF

# 7. Ejecutar migraciones
echo "🔄 Ejecutando migraciones de base de datos..."
npx prisma migrate deploy
npx prisma db seed || true

# 8. Build de producción
echo "🔨 Construyendo aplicación para producción..."
npm run build

# 9. Instalar PM2 si no existe
echo "📦 Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2..."
    sudo npm install -g pm2
fi

# 10. Detener instancia anterior de PM2 si existe
pm2 delete toma-turno 2>/dev/null || true

# 11. Iniciar aplicación con PM2
echo "🚀 Iniciando aplicación con PM2..."
pm2 start npm --name "toma-turno" -- start

# 12. Configurar PM2 para inicio automático
pm2 save
pm2 startup systemd -u dynamtek --hp /home/dynamtek

# 13. Verificar estado
echo "✅ Verificando estado..."
pm2 status
sleep 3

# 14. Test de salud
echo "🏥 Probando endpoint de salud..."
curl -s http://localhost:3000/api/health | python3 -m json.tool

# 15. Configurar firewall
echo "🔥 Configurando firewall..."
sudo ufw allow 3000/tcp

echo ""
echo "========================================="
echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "========================================="
echo "📍 La aplicación está disponible en:"
echo "   http://192.168.2.190:3000"
echo ""
echo "📊 Para ver logs: pm2 logs toma-turno"
echo "🔄 Para reiniciar: pm2 restart toma-turno"
echo "⏹️  Para detener: pm2 stop toma-turno"
echo "========================================="