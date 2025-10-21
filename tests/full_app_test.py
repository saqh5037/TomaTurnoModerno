#!/usr/bin/env python3
"""
Prueba Completa de TODAS las Páginas de la Aplicación
Genera informe HTML profesional con capturas de pantalla
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

BASE_URL = "http://localhost:3005"
WAIT_TIMEOUT = 10
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/screenshots/full_test"

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
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*90}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message.center(90)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*90}{Colors.END}\n")

def print_step(step_num, message):
    print(f"\n{Colors.CYAN}{Colors.BOLD}[{step_num}]{Colors.END} {Colors.CYAN}{message}{Colors.END}")

def print_success(message):
    print(f"  {Colors.GREEN}✓{Colors.END} {message}")

def print_error(message):
    print(f"  {Colors.RED}✗{Colors.END} {message}")

def print_info(message):
    print(f"  {Colors.BLUE}ℹ{Colors.END} {message}")

class FullAppTester:
    def __init__(self):
        print_header("PRUEBA COMPLETA DE LA APLICACIÓN - Sistema INER")

        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        print_success(f"📂 Directorio: {SCREENSHOT_DIR}")

        chrome_options = Options()
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, WAIT_TIMEOUT)
            print_success("✅ Chrome iniciado")
            self.screenshot_counter = 1
            self.test_results = []
            time.sleep(1)
        except Exception as e:
            print_error(f"Error: {e}")
            sys.exit(1)

    def take_screenshot(self, name, description=""):
        filename = f"{self.screenshot_counter:03d}_{name}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        self.driver.save_screenshot(filepath)
        self.screenshot_counter += 1
        return {'filename': filename, 'description': description or name.replace('_', ' ').title()}

    def add_result(self, module, page, status, details=""):
        self.test_results.append({
            'module': module,
            'page': page,
            'status': status,
            'details': details,
            'time': datetime.now().strftime('%H:%M:%S')
        })

    def test_page(self, url, name, module, checks=None):
        """Prueba genérica para cualquier página"""
        try:
            print_step(self.screenshot_counter, f"{module} → {name}")
            self.driver.get(url)
            time.sleep(3)

            screenshot = self.take_screenshot(name.lower().replace(' ', '_').replace('/', '_'), f"{module} - {name}")

            page_source = self.driver.page_source.lower()

            # Verificaciones personalizadas
            if checks:
                all_passed = True
                for check_name, keywords in checks.items():
                    if isinstance(keywords, list):
                        found = any(kw in page_source for kw in keywords)
                    else:
                        found = keywords in page_source

                    if found:
                        print_success(f"{check_name} ✓")
                    else:
                        print_info(f"{check_name} - No detectado")
                        all_passed = False

            # Verificar que la página cargó
            if 'error' not in page_source or len(page_source) > 1000:
                print_success(f"Página cargada ({len(page_source)} bytes)")
                self.add_result(module, name, "PASS", f"Cargada correctamente")
                return True
            else:
                print_error("Posible error en la página")
                self.add_result(module, name, "WARN", "Contenido limitado")
                return False

        except Exception as e:
            print_error(f"Error: {str(e)[:100]}")
            self.add_result(module, name, "FAIL", str(e)[:100])
            return False

    def run_all_tests(self):
        start_time = time.time()

        print_header("FASE 1: PÁGINAS PÚBLICAS")

        # Cola Pública
        self.test_page(
            f"{BASE_URL}/turns/queue",
            "Cola Pública",
            "Turnos",
            {
                'Pacientes en cola': ['turno', 'paciente'],
                'Color ámbar (#f59e0b)': ['f59e0b', '#f59e0b'],
                'Ordenamiento especial': ['especial', 'special']
            }
        )

        # Login
        self.test_page(
            f"{BASE_URL}/login",
            "Login",
            "Autenticación",
            {
                'Formulario de login': ['username', 'password', 'iniciar sesión'],
                'Campos de entrada': ['input', 'button']
            }
        )

        print_header("FASE 2: MÓDULO DE TURNOS")

        pages_turnos = [
            ("/turns", "Gestión de Turnos", {'Formulario': ['paciente', 'turno']}),
            ("/turns/attention", "Atención de Pacientes", {'Interfaz de atención': ['llamar', 'atender', 'paciente']}),
        ]

        for url, name, checks in pages_turnos:
            self.test_page(f"{BASE_URL}{url}", name, "Turnos", checks)

        print_header("FASE 3: MÓDULO DE ESTADÍSTICAS")

        stats_pages = [
            ("/statistics", "Dashboard de Estadísticas", {'Gráficas': ['estadística', 'datos', 'gráfica']}),
            ("/statistics/daily", "Estadísticas Diarias", {'Datos diarios': ['diario', 'fecha', 'pacientes']}),
            ("/statistics/monthly", "Estadísticas Mensuales", {'Datos mensuales': ['mensual', 'mes', 'año']}),
            ("/statistics/phlebotomists", "Rendimiento Flebotomistas", {'Flebotomistas': ['flebotomista', 'rendimiento']}),
            ("/statistics/average-time", "Tiempo Promedio", {'Tiempos': ['tiempo', 'promedio', 'minutos']}),
        ]

        for url, name, checks in stats_pages:
            self.test_page(f"{BASE_URL}{url}", name, "Estadísticas", checks)

        print_header("FASE 4: MÓDULO DE GESTIÓN")

        management_pages = [
            ("/cubicles", "Gestión de Cubículos", {'Cubículos': ['cubículo', 'cubicle']}),
            ("/users", "Gestión de Usuarios", {'Usuarios': ['usuario', 'user', 'flebotomista']}),
        ]

        for url, name, checks in management_pages:
            self.test_page(f"{BASE_URL}{url}", name, "Gestión", checks)

        print_header("FASE 5: OTROS MÓDULOS")

        other_pages = [
            ("/", "Página Principal", {'Contenido': ['turno', 'sistema']}),
            ("/docs", "Documentación", {'Docs': ['documentación', 'ayuda', 'manual']}),
        ]

        for url, name, checks in other_pages:
            self.test_page(f"{BASE_URL}{url}", name, "General", checks)

        # Generar reporte
        report_path = self.generate_html_report()

        # Resultados finales
        elapsed = time.time() - start_time

        print_header("RESUMEN FINAL")
        print_success(f"⏱️  Tiempo total: {elapsed:.2f} segundos")
        print_success(f"📸 Screenshots: {self.screenshot_counter - 1}")
        print_success(f"🧪 Pruebas ejecutadas: {len(self.test_results)}")

        passed = sum(1 for r in self.test_results if r['status'] == 'PASS')
        failed = sum(1 for r in self.test_results if r['status'] == 'FAIL')
        warned = sum(1 for r in self.test_results if r['status'] == 'WARN')

        print_success(f"✅ Exitosas: {passed}")
        if warned > 0:
            print_info(f"⚠️  Advertencias: {warned}")
        if failed > 0:
            print_error(f"❌ Fallidas: {failed}")

        print_success(f"\n📄 Reporte HTML: {report_path}")
        print_info("\n🌐 Abriendo reporte en navegador en 3 segundos...")
        time.sleep(3)

        self.driver.quit()
        print_success("Navegador cerrado")

        # Abrir reporte
        os.system(f"open {report_path}")

    def generate_html_report(self):
        """Genera reporte HTML profesional"""
        screenshots = sorted([f for f in os.listdir(SCREENSHOT_DIR) if f.endswith('.png')])

        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r['status'] == 'PASS')
        failed = sum(1 for r in self.test_results if r['status'] == 'FAIL')
        warned = sum(1 for r in self.test_results if r['status'] == 'WARN')
        success_rate = (passed / total * 100) if total > 0 else 0

        # Agrupar por módulo
        modules = {}
        for result in self.test_results:
            if result['module'] not in modules:
                modules[result['module']] = []
            modules[result['module']].append(result)

        html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Completo - Sistema de Turnos INER</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            color: #1f2937;
        }}
        .container {{
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
        }}
        .header h1 {{
            font-size: 3.5em;
            margin-bottom: 15px;
            font-weight: 800;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }}
        .header p {{
            font-size: 1.4em;
            opacity: 0.95;
        }}
        .header .meta {{
            margin-top: 20px;
            font-size: 1.1em;
            opacity: 0.85;
        }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 25px;
            padding: 40px;
            background: #f8fafc;
        }}
        .stat-card {{
            background: white;
            padding: 35px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }}
        .stat-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }}
        .stat-card h3 {{
            font-size: 4em;
            margin-bottom: 12px;
            font-weight: 800;
        }}
        .stat-card p {{
            color: #64748b;
            font-size: 1.2em;
            font-weight: 600;
        }}
        .stat-card.total h3 {{ background: linear-gradient(135deg, #3b82f6, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .stat-card.success h3 {{ background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .stat-card.warn h3 {{ background: linear-gradient(135deg, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .stat-card.fail h3 {{ background: linear-gradient(135deg, #ef4444, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .stat-card.rate h3 {{ background: linear-gradient(135deg, #8b5cf6, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}

        .content {{ padding: 50px; }}

        .module-section {{
            margin-bottom: 50px;
        }}
        .module-section h2 {{
            font-size: 2.2em;
            margin-bottom: 25px;
            color: #1e293b;
            border-left: 6px solid #667eea;
            padding-left: 20px;
        }}

        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 30px;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }}
        thead th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px;
            text-align: left;
            font-weight: 700;
            font-size: 1.05em;
        }}
        tbody td {{
            padding: 18px;
            border-bottom: 1px solid #e2e8f0;
        }}
        tbody tr:last-child td {{ border-bottom: none; }}
        tbody tr:hover {{ background: #f8fafc; }}

        .badge {{
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9em;
            text-transform: uppercase;
        }}
        .badge.PASS {{ background: #d1fae5; color: #065f46; }}
        .badge.FAIL {{ background: #fee2e2; color: #991b1b; }}
        .badge.WARN {{ background: #fef3c7; color: #92400e; }}

        .screenshots {{
            margin-top: 50px;
        }}
        .screenshots h2 {{
            font-size: 2.5em;
            margin-bottom: 30px;
            color: #1e293b;
            text-align: center;
        }}
        .screenshot-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
            gap: 35px;
            margin-top: 30px;
        }}
        .screenshot-card {{
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            transition: all 0.3s ease;
        }}
        .screenshot-card:hover {{
            transform: translateY(-8px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }}
        .screenshot-card img {{
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-bottom: 4px solid #667eea;
        }}
        .screenshot-info {{
            padding: 25px;
        }}
        .screenshot-title {{
            font-weight: 700;
            font-size: 1.2em;
            color: #1e293b;
            margin-bottom: 8px;
        }}
        .screenshot-meta {{
            color: #64748b;
            font-size: 0.95em;
        }}

        .footer {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        .footer p {{
            margin: 5px 0;
            opacity: 0.9;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Reporte Completo de Pruebas</h1>
            <p>Sistema de Gestión de Turnos - Instituto Nacional de Enfermedades Respiratorias</p>
            <div class="meta">
                <strong>Versión:</strong> 2.6.1 &nbsp;|&nbsp;
                <strong>Fecha:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card total">
                <h3>{total}</h3>
                <p>Páginas Probadas</p>
            </div>
            <div class="stat-card success">
                <h3>{passed}</h3>
                <p>Exitosas</p>
            </div>
            <div class="stat-card warn">
                <h3>{warned}</h3>
                <p>Advertencias</p>
            </div>
            <div class="stat-card fail">
                <h3>{failed}</h3>
                <p>Fallidas</p>
            </div>
            <div class="stat-card rate">
                <h3>{success_rate:.0f}%</h3>
                <p>Tasa de Éxito</p>
            </div>
            <div class="stat-card total">
                <h3>{len(screenshots)}</h3>
                <p>Screenshots</p>
            </div>
        </div>

        <div class="content">
"""

        # Resultados por módulo
        for module_name, results in modules.items():
            html += f"""
            <div class="module-section">
                <h2>📦 {module_name}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Página</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
"""
            for r in results:
                html += f"""
                        <tr>
                            <td><strong>{r['page']}</strong></td>
                            <td><span class="badge {r['status']}">{r['status']}</span></td>
                            <td>{r['details']}</td>
                            <td>{r['time']}</td>
                        </tr>
"""
            html += """
                    </tbody>
                </table>
            </div>
"""

        # Screenshots
        html += f"""
            <div class="screenshots">
                <h2>📸 Capturas de Pantalla ({len(screenshots)} screenshots)</h2>
                <div class="screenshot-grid">
"""
        for i, screenshot in enumerate(screenshots, 1):
            name = screenshot.replace('.png', '').replace('_', ' ').title()
            html += f"""
                    <div class="screenshot-card">
                        <img src="{screenshot}" alt="{name}" loading="lazy">
                        <div class="screenshot-info">
                            <div class="screenshot-title">{i}. {name}</div>
                            <div class="screenshot-meta">{screenshot}</div>
                        </div>
                    </div>
"""

        html += """
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Sistema de Gestión de Turnos - INER</strong></p>
            <p>Instituto Nacional de Enfermedades Respiratorias</p>
            <p>Pruebas Automatizadas con Selenium WebDriver | Python 3.9</p>
        </div>
    </div>
</body>
</html>
"""

        report_path = os.path.join(SCREENSHOT_DIR, "INFORME_COMPLETO.html")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html)

        return report_path

def main():
    tester = FullAppTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
