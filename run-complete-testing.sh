#!/bin/bash

# ============================================
# SCRIPT DE TESTING COMPLETO - TOMATURNO INER
# ============================================
# Ejecuta suite completa de testing del sistema
# Criticidad: MÁXIMA - Sistema Médico en Producción
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    🏥 TOMATURNO INER - SUITE DE TESTING COMPLETO 🏥    ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if running in production
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${RED}⚠️  ADVERTENCIA: Ejecutando tests en PRODUCCIÓN${NC}"
    read -p "¿Está seguro de continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to run test and capture results
run_test() {
    local test_name=$1
    local test_command=$2
    local start_time=$(date +%s)

    echo -e "${YELLOW}▶ Ejecutando: $test_name${NC}"

    if eval "$test_command" > "/tmp/${test_name}.log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✓ $test_name completado (${duration}s)${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_name falló${NC}"
        return 1
    fi
}

# Create test results directory
RESULTS_DIR="./test-results/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}📁 Directorio de resultados: $RESULTS_DIR${NC}"
echo ""

# ============================================
# 1. DEPENDENCY CHECK
# ============================================
echo -e "${BLUE}[1/8] 📦 Verificando dependencias...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

# Check npm packages
REQUIRED_PACKAGES=("jest" "artillery" "eslint")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! npm list --depth=0 "$package" &> /dev/null; then
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -ne 0 ]; then
    echo -e "${YELLOW}📦 Instalando paquetes faltantes: ${MISSING_PACKAGES[*]}${NC}"
    npm install --save-dev "${MISSING_PACKAGES[@]}"
fi

echo -e "${GREEN}✓ Dependencias verificadas${NC}"
echo ""

# ============================================
# 2. STATIC CODE ANALYSIS
# ============================================
echo -e "${BLUE}[2/8] 🔍 Análisis estático de código...${NC}"

# ESLint
if command -v eslint &> /dev/null; then
    run_test "eslint" "npx eslint src/ --format json --output-file $RESULTS_DIR/eslint-report.json"
else
    echo -e "${YELLOW}⚠️  ESLint no disponible, saltando...${NC}"
fi

# Security audit
run_test "npm_audit" "npm audit --json > $RESULTS_DIR/npm-audit.json"

echo ""

# ============================================
# 3. UNIT TESTS
# ============================================
echo -e "${BLUE}[3/8] 🧪 Tests Unitarios...${NC}"

# Create Jest config if not exists
if [ ! -f "jest.config.js" ]; then
    cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.js',
  ],
};
EOF
fi

# Run Jest tests
if [ -d "tests" ]; then
    run_test "jest_unit" "npx jest --coverage --json --outputFile=$RESULTS_DIR/jest-results.json"
else
    echo -e "${YELLOW}⚠️  No se encontraron tests unitarios${NC}"
fi

echo ""

# ============================================
# 4. API INTEGRATION TESTS
# ============================================
echo -e "${BLUE}[4/8] 🔗 Tests de Integración API...${NC}"

# Check if server is running
if ! curl -s http://localhost:3005/api/health > /dev/null; then
    echo -e "${YELLOW}⚠️  Servidor no disponible en localhost:3005${NC}"
    echo -e "${YELLOW}   Iniciando servidor de pruebas...${NC}"
    npm run dev &
    SERVER_PID=$!
    sleep 5
fi

# Run API tests
if [ -f "tests/functional/critical-flows.test.js" ]; then
    run_test "api_integration" "npx jest tests/functional/critical-flows.test.js --json --outputFile=$RESULTS_DIR/api-test-results.json"
fi

echo ""

# ============================================
# 5. SECURITY TESTS
# ============================================
echo -e "${BLUE}[5/8] 🔒 Tests de Seguridad...${NC}"

# Injection tests
if [ -f "tests/security/injection.test.js" ]; then
    run_test "security_injection" "npx jest tests/security/injection.test.js --json --outputFile=$RESULTS_DIR/security-results.json"
fi

# OWASP ZAP scan (if available)
if command -v zap-cli &> /dev/null; then
    run_test "owasp_zap" "zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:3005"
fi

echo ""

# ============================================
# 6. PERFORMANCE TESTS
# ============================================
echo -e "${BLUE}[6/8] ⚡ Tests de Rendimiento...${NC}"

# Artillery load test
if [ -f "tests/performance/load-test.yml" ]; then
    run_test "load_test" "npx artillery run tests/performance/load-test.yml --output $RESULTS_DIR/load-test-report.json"
fi

# Lighthouse (if available)
if command -v lighthouse &> /dev/null; then
    run_test "lighthouse" "lighthouse http://localhost:3005 --output json --output-path $RESULTS_DIR/lighthouse-report.json --chrome-flags='--headless'"
fi

echo ""

# ============================================
# 7. DATABASE TESTS
# ============================================
echo -e "${BLUE}[7/8] 🗄️ Tests de Base de Datos...${NC}"

# Check database connection
cat > /tmp/db-test.js << 'EOF'
const prisma = require('./lib/prisma').default;

async function testDatabase() {
    try {
        // Test connection
        await prisma.$connect();
        console.log('✓ Conexión exitosa');

        // Test query performance
        const start = Date.now();
        await prisma.turnRequest.count();
        const duration = Date.now() - start;
        console.log(`✓ Query time: ${duration}ms`);

        // Check indexes
        const result = await prisma.$queryRaw`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'TurnRequest'
        `;
        console.log(`✓ Índices encontrados: ${result.length}`);

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

testDatabase();
EOF

run_test "database" "node /tmp/db-test.js"

echo ""

# ============================================
# 8. GENERATE FINAL REPORT
# ============================================
echo -e "${BLUE}[8/8] 📊 Generando reporte final...${NC}"

# Create summary report
cat > "$RESULTS_DIR/TESTING_SUMMARY.md" << EOF
# 📊 REPORTE DE TESTING - TOMATURNO INER

**Fecha**: $(date '+%Y-%m-%d %H:%M:%S')
**Ambiente**: ${NODE_ENV:-development}
**Servidor**: ${HOSTNAME:-localhost}

## 📈 RESUMEN EJECUTIVO

### Resultados Generales
- **Tests Ejecutados**: $(find $RESULTS_DIR -name "*.json" | wc -l)
- **Tiempo Total**: ${TOTAL_TIME:-N/A} segundos

### Estado de Tests

| Categoría | Estado | Observaciones |
|-----------|--------|---------------|
| Análisis Estático | $([ -f "$RESULTS_DIR/eslint-report.json" ] && echo "✅ Completado" || echo "⚠️ No ejecutado") | - |
| Tests Unitarios | $([ -f "$RESULTS_DIR/jest-results.json" ] && echo "✅ Completado" || echo "⚠️ No ejecutado") | - |
| Tests de Integración | $([ -f "$RESULTS_DIR/api-test-results.json" ] && echo "✅ Completado" || echo "⚠️ No ejecutado") | - |
| Tests de Seguridad | $([ -f "$RESULTS_DIR/security-results.json" ] && echo "✅ Completado" || echo "⚠️ No ejecutado") | - |
| Tests de Rendimiento | $([ -f "$RESULTS_DIR/load-test-report.json" ] && echo "✅ Completado" || echo "⚠️ No ejecutado") | - |
| Tests de Base de Datos | ✅ Completado | - |

## 🚨 ISSUES CRÍTICOS

$(grep -h "CRIT-" $RESULTS_DIR/*.log 2>/dev/null || echo "No se encontraron issues críticos")

## ⚠️ VULNERABILIDADES

### NPM Audit
\`\`\`json
$(cat $RESULTS_DIR/npm-audit.json 2>/dev/null | head -20 || echo "No disponible")
\`\`\`

## 📊 MÉTRICAS DE RENDIMIENTO

$([ -f "$RESULTS_DIR/load-test-report.json" ] && echo "Ver archivo: load-test-report.json" || echo "No disponible")

## 📝 RECOMENDACIONES

1. Revisar todos los archivos JSON en el directorio de resultados
2. Priorizar fixes de vulnerabilidades críticas
3. Implementar tests faltantes
4. Configurar CI/CD para testing continuo

## 📁 ARCHIVOS GENERADOS

$(ls -la $RESULTS_DIR | tail -n +2)

---
*Generado automáticamente por el Sistema de Testing TomaTurno*
EOF

echo -e "${GREEN}✓ Reporte generado en: $RESULTS_DIR/TESTING_SUMMARY.md${NC}"
echo ""

# ============================================
# CLEANUP
# ============================================

# Kill test server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo -e "${YELLOW}Deteniendo servidor de pruebas...${NC}"
    kill $SERVER_PID 2>/dev/null || true
fi

# Remove temp files
rm -f /tmp/db-test.js
rm -f /tmp/*.log

# ============================================
# FINAL SUMMARY
# ============================================

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ TESTING COMPLETO FINALIZADO ✅           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 Resultados guardados en: $RESULTS_DIR${NC}"
echo -e "${YELLOW}📊 Ver reporte: $RESULTS_DIR/TESTING_SUMMARY.md${NC}"
echo ""

# Open report in browser if available
if command -v open &> /dev/null; then
    open "$RESULTS_DIR/TESTING_SUMMARY.md"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$RESULTS_DIR/TESTING_SUMMARY.md"
fi

exit 0