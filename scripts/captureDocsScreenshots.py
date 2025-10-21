#!/usr/bin/env python3
"""
Script para capturar screenshots de toda la aplicación y generar documentación
con Selenium + inserción automática en la base de datos
"""
import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

BASE_URL = "http://localhost:3005"
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots"

class DocsScreenshotCapture:
    def __init__(self):
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)

        chrome_options = Options()
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')

        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 15)
        self.screenshots = []

        print("🎬 Iniciando captura de screenshots para documentación...")

    def login(self):
        """Login como admin"""
        print("\n🔐 Login como admin...")
        self.driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        username = self.driver.find_elements(By.TAG_NAME, "input")[0]
        password = self.driver.find_elements(By.TAG_NAME, "input")[1]

        username.send_keys("admin")
        password.send_keys("123")

        submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit.click()
        time.sleep(3)
        print("✅ Login exitoso")

    def capture(self, name, description, tags=[]):
        """Captura un screenshot"""
        filename = f"{name}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        self.driver.save_screenshot(filepath)

        self.screenshots.append({
            'filename': filename,
            'name': name,
            'description': description,
            'tags': tags,
            'path': f"/docs/screenshots/{filename}"
        })

        print(f"  📸 {filename}")
        time.sleep(1)

    def capture_dashboard(self):
        """Captura el dashboard administrativo"""
        print("\n📊 Capturando Dashboard Administrativo...")
        self.driver.get(f"{BASE_URL}/")
        time.sleep(3)

        self.capture(
            "admin-dashboard-overview",
            "Vista general del dashboard administrativo mostrando métricas en tiempo real",
            ["admin", "dashboard", "estadísticas"]
        )

    def capture_users(self):
        """Captura gestión de usuarios"""
        print("\n👥 Capturando Gestión de Usuarios...")
        self.driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        self.capture(
            "admin-users-list",
            "Lista completa de usuarios del sistema con opciones de gestión",
            ["admin", "usuarios", "gestión"]
        )

        # Scroll para ver más contenido
        self.driver.execute_script("window.scrollTo(0, 500)")
        time.sleep(1)

        self.capture(
            "admin-users-details",
            "Detalles de usuarios mostrando roles y permisos",
            ["admin", "usuarios", "permisos"]
        )

    def capture_cubicles(self):
        """Captura gestión de cubículos"""
        print("\n🏥 Capturando Gestión de Cubículos...")
        self.driver.get(f"{BASE_URL}/cubicles")
        time.sleep(3)

        self.capture(
            "admin-cubicles-list",
            "Gestión de cubículos mostrando cubículos generales y especiales",
            ["admin", "cubículos", "gestión"]
        )

    def capture_queue(self):
        """Captura cola pública"""
        print("\n📋 Capturando Cola Pública...")
        self.driver.get(f"{BASE_URL}/turns/queue")
        time.sleep(3)

        self.capture(
            "queue-public-view",
            "Cola pública mostrando pacientes en espera ordenados por prioridad",
            ["turnos", "cola", "pacientes"]
        )

    def capture_attention(self):
        """Captura página de atención"""
        print("\n🏥 Capturando Página de Atención...")
        self.driver.get(f"{BASE_URL}/turns/attention")
        time.sleep(3)

        self.capture(
            "attention-interface",
            "Interfaz principal de atención de pacientes para flebotomistas",
            ["atención", "pacientes", "flebotomista"]
        )

        # Scroll para ver sidebar
        self.driver.execute_script("window.scrollTo(0, 300)")
        time.sleep(1)

        self.capture(
            "attention-patients-sidebar",
            "Sidebar mostrando lista de pacientes sugeridos y en cola",
            ["atención", "sidebar", "pacientes"]
        )

    def capture_statistics(self):
        """Captura módulo de estadísticas"""
        print("\n📊 Capturando Estadísticas...")

        # Dashboard de estadísticas
        self.driver.get(f"{BASE_URL}/statistics")
        time.sleep(3)
        self.capture(
            "statistics-dashboard",
            "Dashboard principal de estadísticas con métricas generales",
            ["estadísticas", "dashboard", "métricas"]
        )

        # Estadísticas diarias
        self.driver.get(f"{BASE_URL}/statistics/daily")
        time.sleep(3)
        self.capture(
            "statistics-daily",
            "Estadísticas diarias mostrando pacientes atendidos por día",
            ["estadísticas", "diarias", "gráficas"]
        )

        # Estadísticas mensuales
        self.driver.get(f"{BASE_URL}/statistics/monthly")
        time.sleep(3)
        self.capture(
            "statistics-monthly",
            "Estadísticas mensuales con comparativas y tendencias",
            ["estadísticas", "mensuales", "tendencias"]
        )

        # Rendimiento de flebotomistas
        self.driver.get(f"{BASE_URL}/statistics/phlebotomists")
        time.sleep(3)
        self.capture(
            "statistics-phlebotomists",
            "Rendimiento individual de flebotomistas con métricas de productividad",
            ["estadísticas", "flebotomistas", "rendimiento"]
        )

        # Tiempo promedio
        self.driver.get(f"{BASE_URL}/statistics/average-time")
        time.sleep(3)
        self.capture(
            "statistics-time",
            "Análisis de tiempo promedio de atención por paciente",
            ["estadísticas", "tiempo", "promedio"]
        )

    def capture_turns_creation(self):
        """Captura creación de turnos"""
        print("\n🎫 Capturando Creación de Turnos...")
        self.driver.get(f"{BASE_URL}/turns")
        time.sleep(3)

        self.capture(
            "turns-creation-form",
            "Formulario para crear nuevos turnos de pacientes",
            ["turnos", "crear", "formulario"]
        )

    def run_capture(self):
        """Ejecuta todas las capturas"""
        try:
            self.login()

            self.capture_dashboard()
            self.capture_users()
            self.capture_cubicles()
            self.capture_queue()
            self.capture_attention()
            self.capture_statistics()
            self.capture_turns_creation()

            print(f"\n✅ Capturas completadas: {len(self.screenshots)} screenshots")

            # Generar archivo JSON con metadata
            import json
            metadata_path = os.path.join(SCREENSHOT_DIR, "screenshots-metadata.json")
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(self.screenshots, f, indent=2, ensure_ascii=False)

            print(f"📄 Metadata guardada en: {metadata_path}")

            # Mostrar lista
            print("\n📋 Screenshots capturados:")
            for ss in self.screenshots:
                print(f"  • {ss['filename']}")
                print(f"    {ss['description']}")
                print(f"    Tags: {', '.join(ss['tags'])}")
                print()

            time.sleep(3)

        finally:
            self.driver.quit()
            print("✅ Navegador cerrado")

def main():
    capturer = DocsScreenshotCapture()
    capturer.run_capture()

if __name__ == "__main__":
    main()
