#!/usr/bin/env python3
"""
Prueba Visual Interactiva con Selenium
Muestra la interacción real con la aplicación
"""
import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

BASE_URL = "http://localhost:3005"
WAIT_TIMEOUT = 10

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_step(step_num, message):
    print(f"\n{Colors.CYAN}{Colors.BOLD}[PASO {step_num}]{Colors.END} {Colors.CYAN}{message}{Colors.END}")

def print_action(message):
    print(f"  {Colors.YELLOW}→{Colors.END} {message}")

def print_success(message):
    print(f"  {Colors.GREEN}✓{Colors.END} {message}")

def print_error(message):
    print(f"  {Colors.RED}✗{Colors.END} {message}")

def print_info(message):
    print(f"  {Colors.BLUE}ℹ{Colors.END} {message}")

def wait_for_user(message="Presiona ENTER para continuar..."):
    input(f"\n{Colors.MAGENTA}⏸{Colors.END}  {message}")

class VisualTester:
    def __init__(self):
        print(f"\n{Colors.BOLD}{'='*70}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}  PRUEBA VISUAL INTERACTIVA - Sistema de Turnos INER{Colors.END}")
        print(f"{Colors.BOLD}{'='*70}{Colors.END}\n")

        print_info("Inicializando navegador Chrome...")

        chrome_options = Options()
        # NO usar headless para ver la interacción
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, WAIT_TIMEOUT)
            print_success("Navegador Chrome iniciado correctamente")
            time.sleep(1)
        except Exception as e:
            print_error(f"Error al iniciar Chrome: {e}")
            print_info("Asegúrate de tener ChromeDriver instalado")
            sys.exit(1)

    def test_queue_page(self):
        print_step(1, "Probando página de Cola Pública (/turns/queue)")

        print_action("Navegando a http://localhost:3005/turns/queue")
        self.driver.get(f"{BASE_URL}/turns/queue")
        time.sleep(2)

        wait_for_user("Observa la página de cola. ¿Puedes ver la lista de pacientes?")

        print_action("Buscando pacientes en la lista...")
        try:
            # Buscar tabla o lista de pacientes
            patient_elements = self.driver.find_elements(By.CSS_SELECTOR, "[role='row'], .patient-item, .chakra-stack")
            print_success(f"Encontrados {len(patient_elements)} elementos en la página")

            # Buscar iconos de reloj de arena (color ámbar)
            print_action("Verificando iconos de reloj de arena...")
            hourglasses = self.driver.find_elements(By.TAG_NAME, "svg")
            if hourglasses:
                print_success(f"Encontrados {len(hourglasses)} iconos SVG")
                print_info("Los iconos de reloj de arena deben ser de color ÁMBAR (#f59e0b), NO rojos")

            # Buscar iconos de silla de ruedas (pacientes especiales)
            print_action("Verificando pacientes especiales...")
            print_info("Los pacientes especiales deben tener icono de silla de ruedas")
            print_info("Los pacientes especiales deben aparecer PRIMERO en la lista")

            wait_for_user("Observa el orden de los pacientes. ¿Los especiales están primero?")

        except Exception as e:
            print_error(f"Error al buscar elementos: {e}")

    def test_login_and_attention(self):
        print_step(2, "Probando Login y Página de Atención")

        print_action("Navegando a página de login...")
        self.driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        wait_for_user("Observa la página de login. Voy a hacer login como 'admin'")

        try:
            print_action("Ingresando credenciales...")

            # Buscar campos de login
            username_field = self.wait.until(
                EC.presence_of_element_located((By.NAME, "username"))
            )
            password_field = self.driver.find_element(By.NAME, "password")

            # Llenar campos lentamente para que se vea
            print_info("Usuario: admin")
            username_field.clear()
            for char in "admin":
                username_field.send_keys(char)
                time.sleep(0.1)

            print_info("Password: admin123")
            password_field.clear()
            for char in "admin123":
                password_field.send_keys(char)
                time.sleep(0.1)

            wait_for_user("Credenciales ingresadas. Presiona ENTER para hacer login")

            # Click en login
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()

            print_action("Esperando redirección...")
            time.sleep(3)

            if "/login" not in self.driver.current_url:
                print_success("Login exitoso!")
                print_info(f"URL actual: {self.driver.current_url}")
            else:
                print_error("Login falló - aún en /login")
                return False

        except Exception as e:
            print_error(f"Error en login: {e}")
            return False

        # Ir a página de atención
        print_step(3, "Navegando a Página de Atención (/turns/attention)")

        print_action("Navegando a /turns/attention...")
        self.driver.get(f"{BASE_URL}/turns/attention")
        time.sleep(3)

        wait_for_user("Observa la interfaz de atención. ¿Ves los pacientes en espera?")

        try:
            print_action("Buscando elementos de la interfaz...")

            # Buscar botones
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            print_success(f"Encontrados {len(buttons)} botones en la página")

            # Listar algunos botones importantes
            print_info("\nBotones visibles:")
            for btn in buttons[:10]:  # Primeros 10 botones
                btn_text = btn.text.strip()
                if btn_text:
                    print(f"    • {btn_text}")

            wait_for_user("¿Puedes ver el botón 'Llamar Paciente' o 'Regresar a Cola'?")

            # Buscar sidebar con pacientes
            print_action("\nBuscando lista de pacientes en sidebar...")
            print_info("Los pacientes sugeridos deben tener fondo VERDE")
            print_info("Los pacientes diferidos deben tener icono de reloj ÁMBAR")
            print_info("Los pacientes especiales deben tener icono de silla de ruedas")

            wait_for_user("Observa el sidebar derecho con la lista de pacientes")

        except Exception as e:
            print_error(f"Error: {e}")

    def test_priority_change_button(self):
        print_step(4, "Probando Botón de Cambio de Prioridad (Solo Supervisores)")

        print_action("Buscando botón de cambio de prioridad...")
        print_info("Este botón SOLO debe ser visible para supervisores/admins")
        print_info("El botón debe decir 'Cambiar a Especial' o 'Cambiar a General'")
        print_info("Los iconos deben ser PEQUEÑOS (16px), no grandes")

        try:
            # Buscar todos los botones
            buttons = self.driver.find_elements(By.TAG_NAME, "button")

            priority_buttons = []
            for btn in buttons:
                btn_text = btn.text.strip()
                if "Cambiar a" in btn_text:
                    priority_buttons.append(btn)
                    print_success(f"Encontrado: '{btn_text}'")

            if priority_buttons:
                print_success(f"Botón de cambio de prioridad visible (usuario es supervisor)")
                wait_for_user("Observa el botón. ¿Los iconos son pequeños y sutiles?")
            else:
                print_info("Botón no visible (puede ser que no haya paciente activo o no eres supervisor)")

        except Exception as e:
            print_error(f"Error: {e}")

    def test_defer_button(self):
        print_step(5, "Probando Botón 'Regresar a Cola'")

        print_info("El botón 'Regresar a Cola' debe:")
        print_info("  • Tener icono de reloj de arena")
        print_info("  • Ser de color ROJO con gradiente")
        print_info("  • Tener sombra para destacarse")
        print_info("  • Estar debajo de otros botones")

        try:
            buttons = self.driver.find_elements(By.TAG_NAME, "button")

            defer_buttons = []
            for btn in buttons:
                btn_text = btn.text.strip()
                if "Regresar a Cola" in btn_text or "regresar" in btn_text.lower():
                    defer_buttons.append(btn)
                    print_success(f"Encontrado botón: '{btn_text}'")

            if defer_buttons:
                print_success("Botón 'Regresar a Cola' está visible")
                wait_for_user("Observa el botón. ¿Es rojo y destacado?")
            else:
                print_info("Botón no visible (puede que no haya paciente en atención)")

        except Exception as e:
            print_error(f"Error: {e}")

    def test_color_verification(self):
        print_step(6, "Verificación de Colores")

        print_info("\n🎨 COLORES A VERIFICAR:")
        print_info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print_info("1. Icono reloj de arena (diferido):  ÁMBAR (#f59e0b)")
        print_info("2. Paciente sugerido (fondo):        VERDE claro")
        print_info("3. Botón 'Regresar a Cola':          ROJO con gradiente")
        print_info("4. Icono silla de ruedas:            NARANJA")
        print_info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        wait_for_user("Observa todos los colores. ¿Se ven correctos?")

        # Tomar screenshot
        try:
            screenshot_path = "/Users/samuelquiroz/Documents/proyectos/toma-turno/screenshot_attention.png"
            self.driver.save_screenshot(screenshot_path)
            print_success(f"Screenshot guardado: {screenshot_path}")
        except Exception as e:
            print_error(f"No se pudo guardar screenshot: {e}")

    def run_all_tests(self):
        try:
            print(f"\n{Colors.BOLD}{Colors.MAGENTA}INSTRUCCIONES:{Colors.END}")
            print(f"{Colors.MAGENTA}→ Esta prueba mostrará el navegador en pantalla{Colors.END}")
            print(f"{Colors.MAGENTA}→ Podrás ver cada interacción en tiempo real{Colors.END}")
            print(f"{Colors.MAGENTA}→ Presiona ENTER en cada paso para continuar{Colors.END}")

            wait_for_user("\nPresiona ENTER para comenzar las pruebas...")

            # Ejecutar pruebas
            self.test_queue_page()
            self.test_login_and_attention()
            self.test_priority_change_button()
            self.test_defer_button()
            self.test_color_verification()

            print(f"\n{Colors.BOLD}{Colors.GREEN}{'='*70}{Colors.END}")
            print(f"{Colors.BOLD}{Colors.GREEN}  ✅ PRUEBAS VISUALES COMPLETADAS{Colors.END}")
            print(f"{Colors.BOLD}{Colors.GREEN}{'='*70}{Colors.END}\n")

            wait_for_user("Presiona ENTER para cerrar el navegador...")

        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}⚠ Pruebas interrumpidas por el usuario{Colors.END}")
        except Exception as e:
            print_error(f"Error crítico: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print_info("Cerrando navegador...")
            self.driver.quit()
            print_success("Navegador cerrado")

def main():
    tester = VisualTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
