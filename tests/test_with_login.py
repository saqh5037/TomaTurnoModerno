#!/usr/bin/env python3
"""
Prueba Completa CON LOGIN como Admin
Usuario: admin
Password: 123
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
from selenium.webdriver.common.keys import Keys

BASE_URL = "http://localhost:3005"
WAIT_TIMEOUT = 15
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/screenshots/admin_test"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{msg.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

def print_step(num, msg):
    print(f"\n{Colors.CYAN}{Colors.BOLD}[{num}]{Colors.END} {Colors.CYAN}{msg}{Colors.END}")

def print_success(msg):
    print(f"  {Colors.GREEN}✓{Colors.END} {msg}")

def print_error(msg):
    print(f"  {Colors.RED}✗{Colors.END} {msg}")

def print_info(msg):
    print(f"  {Colors.BLUE}ℹ{Colors.END} {msg}")

class AdminTester:
    def __init__(self):
        print_header("PRUEBA COMPLETA CON LOGIN - Usuario ADMIN")

        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        print_success(f"📂 Screenshots: {SCREENSHOT_DIR}")

        chrome_options = Options()
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, WAIT_TIMEOUT)
        print_success("✅ Chrome iniciado")

        self.counter = 1
        self.results = []
        time.sleep(1)

    def screenshot(self, name):
        filename = f"{self.counter:03d}_{name}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        self.driver.save_screenshot(filepath)
        print_success(f"📸 {filename}")
        self.counter += 1
        time.sleep(0.5)
        return filename

    def add_result(self, module, page, status):
        self.results.append({
            'module': module,
            'page': page,
            'status': status,
            'time': datetime.now().strftime('%H:%M:%S')
        })

    def login_admin(self):
        """Login como admin con password 123"""
        print_step(1, "Login como ADMIN")

        try:
            self.driver.get(f"{BASE_URL}/login")
            time.sleep(3)
            self.screenshot("login_page")

            # Esperar que cargue la página
            print_info("Esperando formulario de login...")

            # Intentar encontrar campos por diferentes métodos
            try:
                # Método 1: Por atributo name
                username_field = self.driver.find_element(By.NAME, "username")
                print_success("Campo username encontrado por NAME")
            except:
                try:
                    # Método 2: Por ID
                    username_field = self.driver.find_element(By.ID, "username")
                    print_success("Campo username encontrado por ID")
                except:
                    # Método 3: Por tipo input
                    inputs = self.driver.find_elements(By.TAG_NAME, "input")
                    username_field = inputs[0] if len(inputs) > 0 else None
                    print_success(f"Campo username encontrado por TAG (total inputs: {len(inputs)})")

            try:
                password_field = self.driver.find_element(By.NAME, "password")
                print_success("Campo password encontrado por NAME")
            except:
                try:
                    password_field = self.driver.find_element(By.ID, "password")
                    print_success("Campo password encontrado por ID")
                except:
                    inputs = self.driver.find_elements(By.TAG_NAME, "input")
                    password_field = inputs[1] if len(inputs) > 1 else None
                    print_success(f"Campo password encontrado por TAG")

            if not username_field or not password_field:
                print_error("No se encontraron los campos de login")
                return False

            # Limpiar y llenar campos
            print_info("Ingresando credenciales...")
            username_field.clear()
            username_field.send_keys("admin")
            time.sleep(0.5)

            password_field.clear()
            password_field.send_keys("123")
            time.sleep(0.5)

            self.screenshot("credentials_filled")

            # Buscar botón de submit
            try:
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                print_success("Botón submit encontrado")
            except:
                try:
                    submit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar') or contains(text(), 'Login') or contains(text(), 'Entrar')]")
                    print_success("Botón submit encontrado por texto")
                except:
                    # Presionar Enter en el campo password
                    print_info("Presionando Enter en password field...")
                    password_field.send_keys(Keys.RETURN)
                    submit_btn = None

            if submit_btn:
                submit_btn.click()
                print_success("Click en botón de login")

            # Esperar redirección
            time.sleep(5)

            current_url = self.driver.current_url
            print_info(f"URL actual: {current_url}")

            if "/login" not in current_url:
                print_success(f"✅ LOGIN EXITOSO → {current_url}")
                self.screenshot("after_login_success")
                self.add_result("Auth", "Login Admin", "PASS")
                return True
            else:
                print_error("Login falló - Aún en /login")
                self.screenshot("login_failed")

                # Verificar si hay mensaje de error
                page_source = self.driver.page_source.lower()
                if 'error' in page_source or 'incorrecto' in page_source or 'inválido' in page_source:
                    print_error("Mensaje de error detectado en la página")

                self.add_result("Auth", "Login Admin", "FAIL")
                return False

        except Exception as e:
            print_error(f"Error en login: {e}")
            self.screenshot("login_error")
            self.add_result("Auth", "Login Admin", "ERROR")
            return False

    def test_page(self, url, name, module):
        """Prueba una página después del login"""
        try:
            print_step(self.counter, f"{module} → {name}")
            self.driver.get(url)
            time.sleep(3)

            self.screenshot(name.lower().replace(' ', '_'))

            # Verificar que no nos redirigió al login
            if "/login" in self.driver.current_url:
                print_error("Redirigido a login - Sesión expirada o sin permisos")
                self.add_result(module, name, "FAIL")
                return False

            page_source = self.driver.page_source.lower()

            if len(page_source) > 1000:
                print_success(f"Página cargada ({len(page_source)} bytes)")
                self.add_result(module, name, "PASS")
                return True
            else:
                print_error("Contenido muy pequeño")
                self.add_result(module, name, "WARN")
                return False

        except Exception as e:
            print_error(f"Error: {str(e)[:80]}")
            self.add_result(module, name, "ERROR")
            return False

    def run_all_tests(self):
        start = time.time()

        # 1. Login
        if not self.login_admin():
            print_error("\n❌ LOGIN FALLÓ - No se pueden ejecutar más pruebas")
            self.driver.quit()
            return

        print_header("PROBANDO MÓDULOS COMO ADMIN")

        # 2. Módulo de Turnos
        print_info("\n📋 MÓDULO DE TURNOS")
        self.test_page(f"{BASE_URL}/turns", "Gestión de Turnos", "Turnos")
        self.test_page(f"{BASE_URL}/turns/queue", "Cola Pública", "Turnos")
        self.test_page(f"{BASE_URL}/turns/attention", "Atención de Pacientes", "Turnos")

        # 3. Módulo de Estadísticas
        print_info("\n📊 MÓDULO DE ESTADÍSTICAS")
        self.test_page(f"{BASE_URL}/statistics", "Dashboard", "Estadísticas")
        self.test_page(f"{BASE_URL}/statistics/daily", "Diarias", "Estadísticas")
        self.test_page(f"{BASE_URL}/statistics/monthly", "Mensuales", "Estadísticas")
        self.test_page(f"{BASE_URL}/statistics/phlebotomists", "Flebotomistas", "Estadísticas")
        self.test_page(f"{BASE_URL}/statistics/average-time", "Tiempo Promedio", "Estadísticas")

        # 4. Módulo de Gestión
        print_info("\n⚙️ MÓDULO DE GESTIÓN")
        self.test_page(f"{BASE_URL}/cubicles", "Cubículos", "Gestión")
        self.test_page(f"{BASE_URL}/users", "Usuarios", "Gestión")

        # 5. Otros
        print_info("\n🏠 OTROS MÓDULOS")
        self.test_page(f"{BASE_URL}/", "Home", "General")
        self.test_page(f"{BASE_URL}/docs", "Documentación", "General")

        # Generar reporte
        report = self.generate_report()

        elapsed = time.time() - start

        print_header("RESUMEN FINAL")
        print_success(f"⏱️  Tiempo: {elapsed:.1f}s")
        print_success(f"📸 Screenshots: {self.counter - 1}")
        print_success(f"🧪 Pruebas: {len(self.results)}")

        passed = sum(1 for r in self.results if r['status'] == 'PASS')
        failed = sum(1 for r in self.results if r['status'] == 'FAIL')
        errors = sum(1 for r in self.results if r['status'] == 'ERROR')

        print_success(f"✅ Exitosas: {passed}")
        if failed > 0:
            print_error(f"❌ Fallidas: {failed}")
        if errors > 0:
            print_error(f"⚠️  Errores: {errors}")

        print_success(f"\n📄 Reporte: {report}")

        time.sleep(3)
        self.driver.quit()
        print_success("Navegador cerrado")

        # Abrir reporte
        os.system(f"open {report}")

    def generate_report(self):
        """Genera reporte HTML"""
        screenshots = sorted([f for f in os.listdir(SCREENSHOT_DIR) if f.endswith('.png')])

        total = len(self.results)
        passed = sum(1 for r in self.results if r['status'] == 'PASS')
        failed = sum(1 for r in self.results if r['status'] == 'FAIL')
        errors = sum(1 for r in self.results if r['status'] == 'ERROR')
        rate = (passed / total * 100) if total > 0 else 0

        html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Login Admin - Sistema INER</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            padding: 50px;
            text-align: center;
        }}
        .header h1 {{ font-size: 3em; margin-bottom: 10px; }}
        .header p {{ font-size: 1.3em; opacity: 0.9; }}

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
        .stat-card h3 {{ font-size: 3em; margin-bottom: 10px; }}
        .stat-card.success h3 {{ color: #10b981; }}
        .stat-card.fail h3 {{ color: #ef4444; }}
        .stat-card.total h3 {{ color: #3b82f6; }}

        .content {{ padding: 40px; }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
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
        }}
        td {{
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }}
        tr:hover {{ background: #f9fafb; }}

        .badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }}
        .badge.PASS {{ background: #d1fae5; color: #065f46; }}
        .badge.FAIL {{ background: #fee2e2; color: #991b1b; }}
        .badge.ERROR {{ background: #fef3c7; color: #92400e; }}

        .screenshots {{
            margin-top: 40px;
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
        }}
        .screenshot-card img {{
            width: 100%;
            height: 250px;
            object-fit: cover;
        }}
        .screenshot-info {{
            padding: 20px;
        }}
        .screenshot-title {{
            font-weight: bold;
            margin-bottom: 5px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Reporte de Pruebas - Login Admin</h1>
            <p>Sistema de Gestión de Turnos INER</p>
            <p style="font-size: 0.9em; margin-top: 10px;">
                {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
            </p>
        </div>

        <div class="stats">
            <div class="stat-card total">
                <h3>{total}</h3>
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
            <div class="stat-card fail">
                <h3>{errors}</h3>
                <p>Errores</p>
            </div>
            <div class="stat-card total">
                <h3>{rate:.0f}%</h3>
                <p>Éxito</p>
            </div>
        </div>

        <div class="content">
            <h2>📊 Resultados</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Módulo</th>
                        <th>Página</th>
                        <th>Estado</th>
                        <th>Hora</th>
                    </tr>
                </thead>
                <tbody>
"""

        for i, r in enumerate(self.results, 1):
            html += f"""
                    <tr>
                        <td>{i}</td>
                        <td>{r['module']}</td>
                        <td><strong>{r['page']}</strong></td>
                        <td><span class="badge {r['status']}">{r['status']}</span></td>
                        <td>{r['time']}</td>
                    </tr>
"""

        html += f"""
                </tbody>
            </table>

            <div class="screenshots">
                <h2>📸 Capturas ({len(screenshots)} screenshots)</h2>
                <div class="screenshot-grid">
"""

        for i, ss in enumerate(screenshots, 1):
            name = ss.replace('.png', '').replace('_', ' ').title()
            html += f"""
                    <div class="screenshot-card">
                        <img src="{ss}" alt="{name}">
                        <div class="screenshot-info">
                            <div class="screenshot-title">{i}. {name}</div>
                        </div>
                    </div>
"""

        html += """
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""

        report_path = os.path.join(SCREENSHOT_DIR, "REPORTE_ADMIN.html")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html)

        return report_path

def main():
    tester = AdminTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
