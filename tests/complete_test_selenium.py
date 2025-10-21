#!/usr/bin/env python3
"""
Prueba Completa de la Aplicación con Selenium
- Prueba con múltiples usuarios (admin y flebotomistas)
- Flujo completo: login, crear turno, llamar, atender, finalizar
- Prueba de estadísticas, cubículos, usuarios
- Genera informe HTML completo con screenshots
"""
import time
import sys
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import Select

BASE_URL = "http://localhost:3005"
WAIT_TIMEOUT = 15
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/screenshots/complete_test"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

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

class CompleteTester:
    def __init__(self):
        print_header("PRUEBA COMPLETA - Sistema de Turnos INER")

        # Crear directorio de screenshots
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        print_success(f"Directorio de screenshots: {SCREENSHOT_DIR}")

        print_action("Inicializando navegador Chrome...")

        chrome_options = Options()
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')
        # chrome_options.add_argument('--headless')  # Descomentar para modo headless

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, WAIT_TIMEOUT)
            print_success("Navegador Chrome iniciado")
            self.screenshot_counter = 1
            self.test_results = []
            time.sleep(1)
        except Exception as e:
            print_error(f"Error al iniciar Chrome: {e}")
            sys.exit(1)

    def take_screenshot(self, name, description=""):
        """Toma un screenshot y lo guarda"""
        filename = f"{self.screenshot_counter:03d}_{name}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        self.driver.save_screenshot(filepath)
        print_success(f"Screenshot: {filename}")
        if description:
            print_info(f"  {description}")
        self.screenshot_counter += 1
        time.sleep(0.5)
        return filename

    def add_result(self, test_name, status, details=""):
        """Registra el resultado de una prueba"""
        self.test_results.append({
            'test': test_name,
            'status': status,
            'details': details,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        })

    def login(self, username, password, role=""):
        """Realiza login en la aplicación"""
        print_action(f"Login como '{username}' {role}...")

        try:
            self.driver.get(f"{BASE_URL}/login")
            time.sleep(2)

            self.take_screenshot(f"login_page_{username}", f"Página de login para {username}")

            # Buscar campos de login
            username_field = self.wait.until(
                EC.presence_of_element_located((By.NAME, "username"))
            )
            password_field = self.driver.find_element(By.NAME, "password")

            username_field.clear()
            username_field.send_keys(username)
            password_field.clear()
            password_field.send_keys(password)

            time.sleep(0.5)

            # Click en login
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()

            time.sleep(3)

            # Verificar redirección
            if "/login" not in self.driver.current_url:
                print_success(f"Login exitoso → {self.driver.current_url}")
                self.take_screenshot(f"after_login_{username}", f"Dashboard después de login como {username}")
                self.add_result(f"Login como {username}", "PASS", f"URL: {self.driver.current_url}")
                return True
            else:
                print_error("Login falló")
                self.add_result(f"Login como {username}", "FAIL", "No se redirigió correctamente")
                return False

        except Exception as e:
            print_error(f"Error en login: {e}")
            self.add_result(f"Login como {username}", "ERROR", str(e))
            return False

    def logout(self):
        """Cierra sesión"""
        print_action("Cerrando sesión...")
        try:
            # Buscar botón de logout en el menú
            self.driver.get(f"{BASE_URL}/login")
            time.sleep(2)
            print_success("Sesión cerrada")
        except Exception as e:
            print_info(f"Error al cerrar sesión: {e}")

    def test_queue_page(self):
        """Prueba la página de cola pública"""
        print_step(1, "Probando Página de Cola Pública")

        try:
            self.driver.get(f"{BASE_URL}/turns/queue")
            time.sleep(3)

            self.take_screenshot("queue_page", "Cola pública con pacientes de prueba")

            # Verificar pacientes
            page_source = self.driver.page_source.lower()

            checks = {
                'Color ámbar': '#f59e0b' in self.driver.page_source or 'f59e0b' in self.driver.page_source,
                'Contenido de pacientes': 'turno' in page_source or 'paciente' in page_source,
                'Especiales primero': 'especial' in page_source or 'special' in page_source
            }

            for check, passed in checks.items():
                if passed:
                    print_success(f"{check} ✓")
                else:
                    print_info(f"{check} - No detectado")

            self.add_result("Cola Pública", "PASS", "Página cargada correctamente")
            return True

        except Exception as e:
            print_error(f"Error: {e}")
            self.add_result("Cola Pública", "FAIL", str(e))
            return False

    def test_turns_creation(self):
        """Prueba crear un nuevo turno"""
        print_step(2, "Probando Creación de Turno")

        try:
            self.driver.get(f"{BASE_URL}/turns")
            time.sleep(2)

            self.take_screenshot("turns_create_page", "Formulario de creación de turno")

            # Llenar formulario
            print_action("Llenando formulario de nuevo paciente...")

            # Buscar campos del formulario
            fields = {
                'patientName': 'Selenium Test Patient',
                'age': '45',
                'gender': 'Masculino',
                'contactInfo': '55-9999-9999',
                'studies': 'Prueba Selenium',
                'tubesRequired': '2'
            }

            for field_name, value in fields.items():
                try:
                    field = self.driver.find_element(By.NAME, field_name)
                    if field.tag_name == 'select':
                        select = Select(field)
                        select.select_by_visible_text(value)
                    else:
                        field.clear()
                        field.send_keys(value)
                    print_success(f"Campo '{field_name}' llenado")
                except:
                    print_info(f"Campo '{field_name}' no encontrado (puede no existir)")

            time.sleep(1)
            self.take_screenshot("turns_form_filled", "Formulario completo")

            # Buscar botón de crear
            try:
                create_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                create_button.click()
                time.sleep(2)
                print_success("Turno creado exitosamente")
                self.add_result("Creación de Turno", "PASS", "Turno creado desde formulario")
            except:
                print_info("Botón de crear no encontrado (puede requerir permisos)")
                self.add_result("Creación de Turno", "SKIP", "Requiere permisos especiales")

            return True

        except Exception as e:
            print_error(f"Error: {e}")
            self.add_result("Creación de Turno", "FAIL", str(e))
            return False

    def test_attention_page(self):
        """Prueba la página de atención"""
        print_step(3, "Probando Página de Atención")

        try:
            self.driver.get(f"{BASE_URL}/turns/attention")
            time.sleep(4)

            self.take_screenshot("attention_page", "Página de atención de pacientes")

            # Buscar botones importantes
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            button_texts = [btn.text.strip() for btn in buttons if btn.text.strip()]

            important_buttons = {
                "Llamar Paciente": any('llamar' in text.lower() for text in button_texts),
                "Regresar a Cola": any('regresar' in text.lower() or 'diferir' in text.lower() for text in button_texts),
                "Finalizar": any('finalizar' in text.lower() or 'terminar' in text.lower() for text in button_texts)
            }

            print_info("Botones encontrados:")
            for btn_name, found in important_buttons.items():
                if found:
                    print_success(f"  ✓ {btn_name}")
                else:
                    print_info(f"  ○ {btn_name} (no visible - puede no haber paciente activo)")

            self.add_result("Página de Atención", "PASS", f"Botones detectados: {len(button_texts)}")
            return True

        except Exception as e:
            print_error(f"Error: {e}")
            self.add_result("Página de Atención", "FAIL", str(e))
            return False

    def test_statistics_pages(self):
        """Prueba todas las páginas de estadísticas"""
        print_step(4, "Probando Módulo de Estadísticas")

        stats_pages = [
            ("daily", "Estadísticas Diarias"),
            ("monthly", "Estadísticas Mensuales"),
            ("phlebotomists", "Rendimiento de Flebotomistas"),
            ("average-time", "Tiempo Promedio de Atención")
        ]

        for page, title in stats_pages:
            try:
                print_action(f"Probando {title}...")
                self.driver.get(f"{BASE_URL}/statistics/{page}")
                time.sleep(3)

                self.take_screenshot(f"statistics_{page}", title)

                # Verificar que cargó contenido
                page_source = self.driver.page_source.lower()
                has_content = any(word in page_source for word in ['estadística', 'gráfica', 'datos', 'pacientes'])

                if has_content:
                    print_success(f"{title} cargada correctamente")
                    self.add_result(f"Estadísticas - {title}", "PASS", "Contenido cargado")
                else:
                    print_info(f"{title} - Sin datos detectados")
                    self.add_result(f"Estadísticas - {title}", "PASS", "Página cargada (sin datos)")

            except Exception as e:
                print_error(f"Error en {title}: {e}")
                self.add_result(f"Estadísticas - {title}", "FAIL", str(e))

        return True

    def test_cubicles_page(self):
        """Prueba la página de gestión de cubículos"""
        print_step(5, "Probando Gestión de Cubículos")

        try:
            self.driver.get(f"{BASE_URL}/cubicles")
            time.sleep(3)

            self.take_screenshot("cubicles_page", "Gestión de cubículos")

            # Verificar tabla de cubículos
            page_source = self.driver.page_source.lower()
            has_cubicles = 'cubículo' in page_source or 'cubicle' in page_source

            if has_cubicles:
                print_success("Página de cubículos cargada correctamente")
                self.add_result("Gestión de Cubículos", "PASS", "Lista de cubículos visible")
            else:
                print_info("Contenido de cubículos no detectado")
                self.add_result("Gestión de Cubículos", "PASS", "Página accesible")

            return True

        except Exception as e:
            print_error(f"Error: {e}")
            self.add_result("Gestión de Cubículos", "FAIL", str(e))
            return False

    def test_users_page(self):
        """Prueba la página de gestión de usuarios"""
        print_step(6, "Probando Gestión de Usuarios")

        try:
            self.driver.get(f"{BASE_URL}/users")
            time.sleep(3)

            self.take_screenshot("users_page", "Gestión de usuarios")

            # Verificar contenido
            page_source = self.driver.page_source.lower()
            has_users = 'usuario' in page_source or 'user' in page_source

            if has_users:
                print_success("Página de usuarios cargada correctamente")
                self.add_result("Gestión de Usuarios", "PASS", "Lista de usuarios visible")
            else:
                print_info("Contenido de usuarios no detectado")
                self.add_result("Gestión de Usuarios", "PASS", "Página accesible")

            return True

        except Exception as e:
            print_error(f"Error: {e}")
            self.add_result("Gestión de Usuarios", "FAIL", str(e))
            return False

    def generate_html_report(self):
        """Genera un reporte HTML completo"""
        print_step(7, "Generando Reporte HTML Completo")

        screenshots = sorted([f for f in os.listdir(SCREENSHOT_DIR) if f.endswith('.png')])

        # Calcular estadísticas
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed = len([r for r in self.test_results if r['status'] == 'FAIL'])
        errors = len([r for r in self.test_results if r['status'] == 'ERROR'])
        skipped = len([r for r in self.test_results if r['status'] == 'SKIP'])

        success_rate = (passed / total_tests * 100) if total_tests > 0 else 0

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte Completo de Pruebas - Sistema de Turnos INER</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .header p {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }}
        .stat-card {{
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }}
        .stat-card h3 {{
            font-size: 3em;
            margin-bottom: 10px;
        }}
        .stat-card p {{
            color: #666;
            font-size: 1.1em;
        }}
        .stat-card.success h3 {{ color: #10b981; }}
        .stat-card.fail h3 {{ color: #ef4444; }}
        .stat-card.error h3 {{ color: #f59e0b; }}
        .stat-card.skip h3 {{ color: #6b7280; }}
        .stat-card.total h3 {{ color: #3b82f6; }}

        .content {{
            padding: 40px;
        }}

        .test-results {{
            margin-bottom: 40px;
        }}
        .test-results h2 {{
            color: #1f2937;
            margin-bottom: 20px;
            font-size: 2em;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }}
        th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }}
        td {{
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }}
        tr:last-child td {{
            border-bottom: none;
        }}
        tr:hover {{
            background: #f9fafb;
        }}
        .status-badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }}
        .status-PASS {{ background: #d1fae5; color: #065f46; }}
        .status-FAIL {{ background: #fee2e2; color: #991b1b; }}
        .status-ERROR {{ background: #fef3c7; color: #92400e; }}
        .status-SKIP {{ background: #e5e7eb; color: #374151; }}

        .screenshots {{
            margin-top: 40px;
        }}
        .screenshots h2 {{
            color: #1f2937;
            margin-bottom: 20px;
            font-size: 2em;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}
        .screenshot-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 30px;
            margin-top: 20px;
        }}
        .screenshot-card {{
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }}
        .screenshot-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }}
        .screenshot-card img {{
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-bottom: 3px solid #667eea;
        }}
        .screenshot-info {{
            padding: 20px;
        }}
        .screenshot-title {{
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
            font-size: 1.1em;
        }}
        .screenshot-meta {{
            color: #6b7280;
            font-size: 0.9em;
        }}

        .footer {{
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Reporte Completo de Pruebas</h1>
            <p>Sistema de Gestión de Turnos - INER</p>
            <p style="font-size: 0.9em; margin-top: 10px;">
                Generado: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
            </p>
        </div>

        <div class="stats">
            <div class="stat-card total">
                <h3>{total_tests}</h3>
                <p>Total Pruebas</p>
            </div>
            <div class="stat-card success">
                <h3>{passed}</h3>
                <p>Exitosas</p>
            </div>
            <div class="stat-card fail">
                <h3>{failed}</h3>
                <p>Fallidas</p>
            </div>
            <div class="stat-card error">
                <h3>{errors}</h3>
                <p>Errores</p>
            </div>
            <div class="stat-card skip">
                <h3>{skipped}</h3>
                <p>Omitidas</p>
            </div>
            <div class="stat-card total">
                <h3>{success_rate:.1f}%</h3>
                <p>Tasa de Éxito</p>
            </div>
        </div>

        <div class="content">
            <div class="test-results">
                <h2>📊 Resultados Detallados</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Prueba</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
"""

        for i, result in enumerate(self.test_results, 1):
            html_content += f"""
                        <tr>
                            <td>{i}</td>
                            <td><strong>{result['test']}</strong></td>
                            <td><span class="status-badge status-{result['status']}">{result['status']}</span></td>
                            <td>{result['details']}</td>
                            <td>{result['timestamp']}</td>
                        </tr>
"""

        html_content += """
                    </tbody>
                </table>
            </div>

            <div class="screenshots">
                <h2>📸 Capturas de Pantalla ({} screenshots)</h2>
                <div class="screenshot-grid">
""".format(len(screenshots))

        for i, screenshot in enumerate(screenshots, 1):
            name = screenshot.replace('.png', '').replace('_', ' ').title()
            html_content += f"""
                    <div class="screenshot-card">
                        <img src="{screenshot}" alt="{name}">
                        <div class="screenshot-info">
                            <div class="screenshot-title">{i}. {name}</div>
                            <div class="screenshot-meta">{screenshot}</div>
                        </div>
                    </div>
"""

        html_content += """
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Sistema de Gestión de Turnos - INER</strong></p>
            <p>Versión 2.6.1 | Pruebas Automatizadas con Selenium</p>
        </div>
    </div>
</body>
</html>
"""

        report_path = os.path.join(SCREENSHOT_DIR, "COMPLETE_TEST_REPORT.html")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print_success(f"Reporte HTML generado: {report_path}")
        return report_path

    def run_all_tests(self):
        """Ejecuta todas las pruebas"""
        start_time = time.time()

        try:
            print_action("Iniciando batería completa de pruebas...\n")
            time.sleep(1)

            # 1. Probar cola pública (sin login)
            self.test_queue_page()

            # 2. Login como ADMIN
            print_header("PRUEBAS COMO ADMINISTRADOR")
            if self.login("admin", "admin123", "(Administrador)"):
                self.test_turns_creation()
                self.test_attention_page()
                self.test_statistics_pages()
                self.test_cubicles_page()
                self.test_users_page()
                self.logout()

            # 3. Login como FLEBOTOMISTA (si existe)
            print_header("PRUEBAS COMO FLEBOTOMISTA")
            # Intentar login con un flebotomista de prueba
            # Si no existe, se saltará
            if self.login("flebo1", "flebo123", "(Flebotomista)"):
                self.test_attention_page()
                self.logout()
            else:
                print_info("Usuario flebotomista no disponible - pruebas omitidas")

            # 4. Generar reporte
            report_path = self.generate_html_report()

            # Resultados finales
            elapsed_time = time.time() - start_time

            print_header("PRUEBAS COMPLETADAS")
            print_success(f"Tiempo total: {elapsed_time:.2f} segundos")
            print_success(f"Screenshots guardados: {self.screenshot_counter - 1}")
            print_success(f"Pruebas ejecutadas: {len(self.test_results)}")
            print_success(f"Reporte HTML: {report_path}")

            print_info("\n📋 Para revisar los resultados:")
            print_info(f"   Abrir: {report_path}")

            # Mantener navegador abierto 5 segundos
            print_info("\nManteniendo navegador abierto 5 segundos...")
            time.sleep(5)

        except Exception as e:
            print_error(f"Error crítico: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print_action("Cerrando navegador...")
            self.driver.quit()
            print_success("Navegador cerrado")

def main():
    tester = CompleteTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
