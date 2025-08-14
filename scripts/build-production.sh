#!/bin/bash

echo "🚀 Iniciando build de producción..."

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf .next
rm -rf out

# Instalar dependencias de producción
echo "📦 Instalando dependencias..."
npm ci --production

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones de base de datos
echo "🗄️ Aplicando migraciones de base de datos..."
npx prisma migrate deploy

# Build de Next.js optimizado
echo "🏗️ Construyendo aplicación..."
NODE_ENV=production npm run build

# Comprimir assets estáticos
echo "📦 Comprimiendo assets..."
find .next -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 -k {} \;

echo "✅ Build de producción completado!"
echo "📝 Para iniciar el servidor: NODE_ENV=production npm start"