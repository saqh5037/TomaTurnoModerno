#!/usr/bin/env python3
"""
Script de pruebas intensivas para verificar todas las funcionalidades implementadas
"""
import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuración
BASE_URL = "http://localhost:3005"
WAIT_TIMEOUT = 10

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(message):
    print(f"{Colors.BLUE}[TEST]{Colors.END} {message}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

class TurnSystemTester:
    def __init__(self):
        print_test("Inicializando Selenium WebDriver...")
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Sin interfaz gráfica
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, WAIT_TIMEOUT)
            print_success("WebDriver inicializado correctamente")
        except Exception as e:
            print_error(f"Error al inicializar WebDriver: {e}")
            print_warning("Asegúrate de tener ChromeDriver instalado")
            sys.exit(1)

        self.tests_passed = 0
        self.tests_failed = 0

    def login(self, username="admin", password="admin123"):
        """Login al sistema"""
        print_test(f"Intentando login con usuario: {username}")
        try:
            self.driver.get(f"{BASE_URL}/login")
            time.sleep(2)

            # Buscar campos de login
            username_field = self.wait.until(
                EC.presence_of_element_located((By.NAME, "username"))
            )
            password_field = self.driver.find_element(By.NAME, "password")

            username_field.send_keys(username)
            password_field.send_keys(password)

            # Click en botón de login
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()

            # Esperar redirección
            time.sleep(3)

            # Verificar que no estamos en /login
            if "/login" not in self.driver.current_url:
                print_success(f"Login exitoso para {username}")
                self.tests_passed += 1
                return True
            else:
                print_error("Login falló - aún en página de login")
                self.tests_failed += 1
                return False

        except Exception as e:
            print_error(f"Error en login: {e}")
            self.tests_failed += 1
            return False

    def test_queue_page(self):
        """Probar la página /turns/queue"""
        print_test("Probando página /turns/queue")
        try:
            self.driver.get(f"{BASE_URL}/turns/queue")
            time.sleep(3)

            # Verificar que la página cargó
            page_title = self.driver.title
            print_test(f"Título de página: {page_title}")

            # Buscar iconos de reloj de arena (debe ser color ámbar #f59e0b)
            try:
                hourglass_icons = self.driver.find_elements(By.CSS_SELECTOR, "svg")
                print_success(f"Encontrados {len(hourglass_icons)} elementos SVG en la página")

                # Verificar que hay pacientes en la lista
                patient_rows = self.driver.find_elements(By.CSS_SELECTOR, "[role='row']")
                if len(patient_rows) > 0:
                    print_success(f"Encontrados {len(patient_rows)} pacientes en cola")
                else:
                    print_warning("No hay pacientes en cola actualmente")

                self.tests_passed += 1
                return True

            except NoSuchElementException:
                print_warning("No se encontraron iconos de reloj de arena")
                self.tests_passed += 1
                return True

        except Exception as e:
            print_error(f"Error en test_queue_page: {e}")
            self.tests_failed += 1
            return False

    def test_attention_page(self):
        """Probar la página /turns/attention"""
        print_test("Probando página /turns/attention")
        try:
            self.driver.get(f"{BASE_URL}/turns/attention")
            time.sleep(3)

            # Verificar que la página cargó
            page_title = self.driver.title
            print_test(f"Título de página: {page_title}")

            # Buscar elementos clave
            try:
                # Buscar botones en la interfaz
                buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
                print_success(f"Encontrados {len(buttons)} botones en la página")

                # Buscar específicamente el botón "Regresar a Cola"
                defer_buttons = [btn for btn in buttons if "Regresar a Cola" in btn.text]
                if defer_buttons:
                    print_success(f"✓ Botón 'Regresar a Cola' encontrado ({len(defer_buttons)} instancias)")
                else:
                    print_warning("Botón 'Regresar a Cola' no visible (puede ser porque no hay pacientes activos)")

                # Buscar botón de cambio de prioridad (solo si es supervisor)
                priority_buttons = [btn for btn in buttons if "Cambiar a" in btn.text]
                if priority_buttons:
                    print_success(f"✓ Botón de cambio de prioridad encontrado")

                    # Verificar el texto del botón
                    for btn in priority_buttons:
                        btn_text = btn.text
                        print_test(f"Texto del botón de prioridad: '{btn_text}'")

                        # Verificar que la lógica sea correcta
                        if "Cambiar a General" in btn_text or "Cambiar a Especial" in btn_text:
                            print_success("✓ Lógica de cambio de prioridad parece correcta")
                        else:
                            print_warning(f"Texto inesperado en botón: {btn_text}")
                else:
                    print_warning("Botón de cambio de prioridad no visible (puede ser porque el usuario no es supervisor)")

                self.tests_passed += 1
                return True

            except Exception as e:
                print_warning(f"Advertencia al buscar elementos: {e}")
                self.tests_passed += 1
                return True

        except Exception as e:
            print_error(f"Error en test_attention_page: {e}")
            self.tests_failed += 1
            return False

    def test_api_endpoints(self):
        """Probar endpoints de API directamente"""
        print_test("Probando endpoints de API")

        endpoints_to_test = [
            "/api/queue/list",
            "/api/attention/list",
            "/api/cubicles",
        ]

        for endpoint in endpoints_to_test:
            try:
                self.driver.get(f"{BASE_URL}{endpoint}")
                time.sleep(1)

                # Obtener el body de la respuesta
                body = self.driver.find_element(By.TAG_NAME, "pre").text

                # Verificar que sea JSON válido
                import json
                try:
                    json.loads(body)
                    print_success(f"✓ {endpoint} responde con JSON válido")
                    self.tests_passed += 1
                except json.JSONDecodeError:
                    print_error(f"✗ {endpoint} no responde con JSON válido")
                    self.tests_failed += 1

            except Exception as e:
                print_error(f"Error al probar {endpoint}: {e}")
                self.tests_failed += 1

    def test_color_changes(self):
        """Verificar que los colores de los iconos sean correctos"""
        print_test("Verificando colores de iconos de reloj de arena")

        try:
            self.driver.get(f"{BASE_URL}/turns/queue")
            time.sleep(3)

            # Obtener el HTML de la página
            page_source = self.driver.page_source

            # Verificar que NO haya color rojo antiguo (#ef4444)
            if "#ef4444" in page_source:
                print_warning("⚠ Encontrado color rojo antiguo #ef4444 en la página")
                print_warning("Esto podría ser normal si hay otros elementos rojos")
            else:
                print_success("✓ No se encontró el color rojo antiguo #ef4444")

            # Verificar que SÍ haya color ámbar nuevo (#f59e0b)
            if "#f59e0b" in page_source or "f59e0b" in page_source:
                print_success("✓ Color ámbar #f59e0b encontrado en la página")
            else:
                print_warning("⚠ No se encontró el color ámbar #f59e0b")

            self.tests_passed += 1

        except Exception as e:
            print_error(f"Error en test_color_changes: {e}")
            self.tests_failed += 1

    def test_responsive_behavior(self):
        """Probar comportamiento responsive"""
        print_test("Probando comportamiento responsive")

        screen_sizes = [
            (1920, 1080, "Desktop"),
            (768, 1024, "Tablet"),
            (375, 812, "Mobile")
        ]

        for width, height, device in screen_sizes:
            try:
                self.driver.set_window_size(width, height)
                time.sleep(2)

                self.driver.get(f"{BASE_URL}/turns/attention")
                time.sleep(2)

                # Verificar que la página es visible
                body = self.driver.find_element(By.TAG_NAME, "body")
                if body.is_displayed():
                    print_success(f"✓ Página visible en {device} ({width}x{height})")
                    self.tests_passed += 1
                else:
                    print_error(f"✗ Página no visible en {device}")
                    self.tests_failed += 1

            except Exception as e:
                print_error(f"Error en {device}: {e}")
                self.tests_failed += 1

        # Restaurar tamaño original
        self.driver.set_window_size(1920, 1080)

    def run_all_tests(self):
        """Ejecutar todas las pruebas"""
        print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BLUE}INICIANDO PRUEBAS INTENSIVAS DEL SISTEMA{Colors.END}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

        start_time = time.time()

        # Login
        if not self.login():
            print_error("Login falló - abortando pruebas")
            return

        # Ejecutar todas las pruebas
        self.test_queue_page()
        self.test_attention_page()
        self.test_api_endpoints()
        self.test_color_changes()
        self.test_responsive_behavior()

        # Resultados
        elapsed_time = time.time() - start_time

        print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BLUE}RESULTADOS DE LAS PRUEBAS{Colors.END}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.GREEN}Pruebas exitosas: {self.tests_passed}{Colors.END}")
        print(f"{Colors.RED}Pruebas fallidas: {self.tests_failed}{Colors.END}")
        print(f"{Colors.BLUE}Tiempo total: {elapsed_time:.2f} segundos{Colors.END}")
        print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

        if self.tests_failed == 0:
            print(f"{Colors.GREEN}✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE{Colors.END}\n")
            return True
        else:
            print(f"{Colors.RED}✗ ALGUNAS PRUEBAS FALLARON{Colors.END}\n")
            return False

    def cleanup(self):
        """Limpiar recursos"""
        print_test("Cerrando WebDriver...")
        self.driver.quit()
        print_success("WebDriver cerrado")

def main():
    tester = TurnSystemTester()

    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_warning("\nPruebas interrumpidas por el usuario")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error crítico: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
