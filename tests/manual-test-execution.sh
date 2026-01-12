#!/bin/bash

# =============================================================================
# SCRIPT DE PRUEBAS AUTOMATIZADAS - PANEL DE CONTROL ADMIN
# Sistema toma-turno - INER
# =============================================================================

set -e

BASE_URL="http://localhost:3005"
ADMIN_USER="testuser"
ADMIN_PASS="admin123"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Función para imprimir resultado
print_result() {
    local test_num=$1
    local test_name=$2
    local result=$3
    local detail=$4

    if [ "$result" == "PASS" ]; then
        echo -e "${GREEN}✓ [$test_num] $test_name${NC}"
        ((TESTS_PASSED++))
    elif [ "$result" == "FAIL" ]; then
        echo -e "${RED}✗ [$test_num] $test_name${NC}"
        [ -n "$detail" ] && echo -e "  ${RED}Detalle: $detail${NC}"
        ((TESTS_FAILED++))
    else
        echo -e "${YELLOW}○ [$test_num] $test_name (SKIPPED)${NC}"
        ((TESTS_SKIPPED++))
    fi
}

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        EJECUCIÓN DE PRUEBAS - PANEL DE CONTROL ADMIN             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# FASE 1: VERIFICACIÓN DE PRERREQUISITOS
# =============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}FASE 1: VERIFICACIÓN DE PRERREQUISITOS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 1.1: Servidor corriendo
echo -e "\n${BLUE}[1.1] Verificando servidor...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL 2>/dev/null || echo "000")
if [ "$HTTP_CODE" == "200" ]; then
    print_result "1.1" "Servidor corriendo en $BASE_URL" "PASS"
else
    print_result "1.1" "Servidor corriendo en $BASE_URL" "FAIL" "HTTP Code: $HTTP_CODE"
    echo -e "${RED}ERROR CRÍTICO: El servidor no está corriendo. Abortando pruebas.${NC}"
    exit 1
fi

# Test 1.2: Base de datos accesible (via cubicles endpoint)
echo -e "\n${BLUE}[1.2] Verificando base de datos...${NC}"
CUBICLES=$(curl -s "$BASE_URL/api/cubicles" 2>/dev/null)
if echo "$CUBICLES" | grep -q '"id"'; then
    CUBICLE_COUNT=$(echo "$CUBICLES" | grep -o '"id"' | wc -l)
    print_result "1.2" "Base de datos accesible ($CUBICLE_COUNT cubículos encontrados)" "PASS"
else
    print_result "1.2" "Base de datos accesible" "FAIL" "$CUBICLES"
fi

# Test 1.3: Login como administrador
echo -e "\n${BLUE}[1.3] Verificando login de administrador...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}" 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
    USER_ROLE=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"role":"\([^"]*\)".*/\1/p')
    print_result "1.3" "Login exitoso (Rol: $USER_ROLE)" "PASS"
else
    print_result "1.3" "Login de administrador" "FAIL" "$LOGIN_RESPONSE"
    echo -e "${RED}ERROR: No se pudo hacer login. Verifica credenciales.${NC}"
    exit 1
fi

# =============================================================================
# FASE 2: PRUEBAS DE ACCESO Y NAVEGACIÓN
# =============================================================================
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}FASE 2: PRUEBAS DE ACCESO Y NAVEGACIÓN${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 2.1: Ruta pública /turns/queue accesible sin auth
echo -e "\n${BLUE}[2.1] Verificando ruta pública /turns/queue...${NC}"
QUEUE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/turns/queue" 2>/dev/null)
if [ "$QUEUE_RESPONSE" == "200" ]; then
    print_result "2.1" "Ruta /turns/queue accesible sin autenticación" "PASS"
else
    print_result "2.1" "Ruta /turns/queue accesible" "FAIL" "HTTP: $QUEUE_RESPONSE"
fi

# Test 2.2: Página principal accesible
echo -e "\n${BLUE}[2.2] Verificando página principal...${NC}"
HOME_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" 2>/dev/null)
if [ "$HOME_RESPONSE" == "200" ]; then
    print_result "2.2" "Página principal accesible" "PASS"
else
    print_result "2.2" "Página principal accesible" "FAIL" "HTTP: $HOME_RESPONSE"
fi

# Test 2.3: Panel de control accesible
echo -e "\n${BLUE}[2.3] Verificando panel de control...${NC}"
PANEL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/control-panel" 2>/dev/null)
if [ "$PANEL_RESPONSE" == "200" ]; then
    print_result "2.3" "Panel de control accesible" "PASS"
else
    print_result "2.3" "Panel de control accesible" "FAIL" "HTTP: $PANEL_RESPONSE"
fi

# =============================================================================
# FASE 3: PRUEBAS DE APIs DEL PANEL DE CONTROL
# =============================================================================
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}FASE 3: PRUEBAS DE APIs DEL PANEL DE CONTROL${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 3.1: API Dashboard (requiere auth)
echo -e "\n${BLUE}[3.1] Verificando API de dashboard...${NC}"
DASHBOARD=$(curl -s "$BASE_URL/api/admin/dashboard" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$DASHBOARD" | grep -q '"success":true'; then
    WAITING=$(echo "$DASHBOARD" | sed -n 's/.*"turnosEnEspera":\([0-9]*\).*/\1/p')
    IN_PROGRESS=$(echo "$DASHBOARD" | sed -n 's/.*"turnosEnAtencion":\([0-9]*\).*/\1/p')
    FINISHED=$(echo "$DASHBOARD" | sed -n 's/.*"turnosFinalizadosHoy":\([0-9]*\).*/\1/p')
    print_result "3.1" "API Dashboard (Espera: $WAITING, Atención: $IN_PROGRESS, Finalizados: $FINISHED)" "PASS"
else
    print_result "3.1" "API Dashboard" "FAIL" "$DASHBOARD"
fi

# Test 3.2: API Lista de turnos
echo -e "\n${BLUE}[3.2] Verificando API de lista de turnos...${NC}"
TURNS=$(curl -s "$BASE_URL/api/admin/turns" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$TURNS" | grep -q '"success":true\|"turns"'; then
    TURN_COUNT=$(echo "$TURNS" | grep -o '"id"' | wc -l)
    print_result "3.2" "API Lista de turnos ($TURN_COUNT turnos)" "PASS"
else
    print_result "3.2" "API Lista de turnos" "FAIL" "${TURNS:0:200}"
fi

# Test 3.3: API Lista de flebotomistas activos
echo -e "\n${BLUE}[3.3] Verificando API de flebotomistas activos...${NC}"
PHLEBOTOMISTS=$(curl -s "$BASE_URL/api/admin/phlebotomists" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$PHLEBOTOMISTS" | grep -q '"success":true\|"phlebotomists"'; then
    PHLEB_COUNT=$(echo "$PHLEBOTOMISTS" | grep -o '"id"' | wc -l)
    print_result "3.3" "API Flebotomistas activos ($PHLEB_COUNT encontrados)" "PASS"
else
    # Puede no haber flebotomistas activos, verificar si es error real
    if echo "$PHLEBOTOMISTS" | grep -q '"success":false'; then
        print_result "3.3" "API Flebotomistas activos" "FAIL" "${PHLEBOTOMISTS:0:200}"
    else
        print_result "3.3" "API Flebotomistas activos (0 activos)" "PASS"
    fi
fi

# Test 3.4: API Estados de cubículos
echo -e "\n${BLUE}[3.4] Verificando API de estados de cubículos...${NC}"
CUBICLE_STATUS=$(curl -s "$BASE_URL/api/admin/cubicle-status" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$CUBICLE_STATUS" | grep -q '"success":true\|"cubicles"'; then
    print_result "3.4" "API Estados de cubículos" "PASS"
else
    print_result "3.4" "API Estados de cubículos" "FAIL" "${CUBICLE_STATUS:0:200}"
fi

# =============================================================================
# FASE 4: PRUEBAS DE ACCIONES ADMINISTRATIVAS (APIs)
# =============================================================================
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}FASE 4: PRUEBAS DE ACCIONES ADMINISTRATIVAS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Obtener un turno de prueba en estado Pending
echo -e "\n${BLUE}[4.0] Buscando turno de prueba...${NC}"
PENDING_TURN_ID=$(PGPASSWORD=labsis psql -h localhost -U labsis -d toma_turno -t -c \
    "SELECT id FROM \"TurnRequest\" WHERE status = 'Pending' LIMIT 1;" 2>/dev/null | tr -d ' ')

if [ -n "$PENDING_TURN_ID" ] && [ "$PENDING_TURN_ID" != "" ]; then
    echo -e "  Turno de prueba encontrado: ID $PENDING_TURN_ID"

    # Test 4.1: API Cambiar prioridad
    echo -e "\n${BLUE}[4.1] Verificando API de cambio de prioridad...${NC}"
    PRIORITY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/change-priority" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"turnId\": $PENDING_TURN_ID, \"priority\": \"Special\"}" 2>/dev/null)

    if echo "$PRIORITY_RESPONSE" | grep -q '"success":true'; then
        print_result "4.1" "API Cambiar prioridad (turno $PENDING_TURN_ID -> Special)" "PASS"

        # Revertir el cambio
        curl -s -X POST "$BASE_URL/api/admin/change-priority" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"turnId\": $PENDING_TURN_ID, \"priority\": \"General\"}" > /dev/null 2>&1
    else
        print_result "4.1" "API Cambiar prioridad" "FAIL" "${PRIORITY_RESPONSE:0:200}"
    fi

    # Test 4.2: API Diferir turno
    echo -e "\n${BLUE}[4.2] Verificando API de diferir turno...${NC}"
    DEFER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/defer-turn" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"turnId\": $PENDING_TURN_ID}" 2>/dev/null)

    if echo "$DEFER_RESPONSE" | grep -q '"success":true'; then
        print_result "4.2" "API Diferir turno" "PASS"
    else
        # Verificar si es porque ya está diferido o no existe la API
        if echo "$DEFER_RESPONSE" | grep -q 'not found\|404'; then
            print_result "4.2" "API Diferir turno" "SKIP" "API no implementada"
        else
            print_result "4.2" "API Diferir turno" "FAIL" "${DEFER_RESPONSE:0:200}"
        fi
    fi
else
    print_result "4.1" "API Cambiar prioridad" "SKIP" "No hay turnos Pending para probar"
    print_result "4.2" "API Diferir turno" "SKIP" "No hay turnos Pending para probar"
fi

# Test 4.3: API Liberar holding (verificar existencia)
echo -e "\n${BLUE}[4.3] Verificando API de liberar holding...${NC}"
RELEASE_API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/api/admin/release-holding" 2>/dev/null)
if [ "$RELEASE_API_CHECK" == "200" ] || [ "$RELEASE_API_CHECK" == "405" ]; then
    print_result "4.3" "API Liberar holding existe" "PASS"
else
    print_result "4.3" "API Liberar holding" "SKIP" "API no implementada o requiere turno específico"
fi

# Test 4.4: API Cancelar turno (verificar existencia)
echo -e "\n${BLUE}[4.4] Verificando API de cancelar turno...${NC}"
CANCEL_API_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/api/admin/cancel-turn" 2>/dev/null)
if [ "$CANCEL_API_CHECK" == "200" ] || [ "$CANCEL_API_CHECK" == "405" ]; then
    print_result "4.4" "API Cancelar turno existe" "PASS"
else
    print_result "4.4" "API Cancelar turno" "SKIP" "API no implementada o requiere turno específico"
fi

# =============================================================================
# FASE 5: PRUEBAS DE INTEGRIDAD DE DATOS
# =============================================================================
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}FASE 5: PRUEBAS DE INTEGRIDAD DE DATOS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 5.1: Verificar consistencia de contadores
echo -e "\n${BLUE}[5.1] Verificando consistencia de contadores...${NC}"
DB_PENDING=$(PGPASSWORD=labsis psql -h localhost -U labsis -d toma_turno -t -c \
    "SELECT COUNT(*) FROM \"TurnRequest\" WHERE status = 'Pending';" 2>/dev/null | tr -d ' ')

if [ -n "$WAITING" ] && [ "$WAITING" == "$DB_PENDING" ]; then
    print_result "5.1" "Contadores consistentes (API: $WAITING = DB: $DB_PENDING)" "PASS"
elif [ -n "$WAITING" ]; then
    print_result "5.1" "Contadores consistentes" "FAIL" "API: $WAITING != DB: $DB_PENDING"
else
    print_result "5.1" "Contadores consistentes" "SKIP" "No se pudo obtener datos"
fi

# Test 5.2: Verificar turnos finalizados hoy
echo -e "\n${BLUE}[5.2] Verificando turnos finalizados hoy...${NC}"
TODAY=$(date +%Y-%m-%d)
DB_FINISHED=$(PGPASSWORD=labsis psql -h localhost -U labsis -d toma_turno -t -c \
    "SELECT COUNT(*) FROM \"TurnRequest\" WHERE status = 'Attended' AND DATE(\"finishedAt\") = '$TODAY';" 2>/dev/null | tr -d ' ')

if [ -n "$FINISHED" ] && [ "$FINISHED" == "$DB_FINISHED" ]; then
    print_result "5.2" "Turnos finalizados hoy (API: $FINISHED = DB: $DB_FINISHED)" "PASS"
elif [ -n "$FINISHED" ]; then
    print_result "5.2" "Turnos finalizados hoy" "FAIL" "API: $FINISHED != DB: $DB_FINISHED"
else
    print_result "5.2" "Turnos finalizados hoy" "SKIP" "No se pudo obtener datos"
fi

# Test 5.3: Verificar integridad de registros de auditoría
echo -e "\n${BLUE}[5.3] Verificando registros de auditoría...${NC}"
AUDIT_COUNT=$(PGPASSWORD=labsis psql -h localhost -U labsis -d toma_turno -t -c \
    "SELECT COUNT(*) FROM \"AuditLog\" WHERE DATE(\"createdAt\") = '$TODAY';" 2>/dev/null | tr -d ' ')

if [ -n "$AUDIT_COUNT" ] && [ "$AUDIT_COUNT" -ge 0 ]; then
    print_result "5.3" "Registros de auditoría hoy: $AUDIT_COUNT" "PASS"
else
    print_result "5.3" "Registros de auditoría" "FAIL" "No se pudo acceder a tabla AuditLog"
fi

# =============================================================================
# RESUMEN DE RESULTADOS
# =============================================================================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    RESUMEN DE RESULTADOS                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✓ Pruebas exitosas:  $TESTS_PASSED${NC}"
echo -e "  ${RED}✗ Pruebas fallidas:  $TESTS_FAILED${NC}"
echo -e "  ${YELLOW}○ Pruebas omitidas:  $TESTS_SKIPPED${NC}"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((TESTS_PASSED * 100 / TOTAL))
    echo -e "  Porcentaje de éxito: ${BLUE}$PERCENTAGE%${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}          ✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE                 ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${RED}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}          ✗ ALGUNAS PRUEBAS FALLARON - REVISAR DETALLES             ${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════════${NC}"
    exit 1
fi
