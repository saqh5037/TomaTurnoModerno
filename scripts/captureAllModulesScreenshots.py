#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para capturar screenshots de TODOS los módulos del sistema
Versión mejorada que captura cada módulo específicamente
"""

import os
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:3005"
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots"

# Asegurar que existe el directorio
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class ModuleScreenshotCapture:
    def __init__(self):
        options = Options()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--force-device-scale-factor=1")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.screenshots = []

    def login(self):
        """Login como admin"""
        print("🔐 Iniciando sesión...")
        self.driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        # Login con admin/123
        username_field = self.driver.find_elements(By.TAG_NAME, "input")[0]
        password_field = self.driver.find_elements(By.TAG_NAME, "input")[1]

        username_field.send_keys("admin")
        password_field.send_keys("123")

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        time.sleep(3)
        print("✅ Sesión iniciada")

    def capture(self, filename, name, description, tags, module_id):
        """Captura un screenshot con metadata"""
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        self.driver.save_screenshot(filepath)

        file_size = os.path.getsize(filepath)
        size_kb = file_size / 1024

        self.screenshots.append({
            'moduleId': module_id,
            'filename': filename,
            'name': name,
            'description': description,
            'tags': tags,
            'path': f"/docs/screenshots/{filename}",
            'size': f"{size_kb:.1f} KB"
        })

        print(f"  📸 {filename} ({size_kb:.1f} KB)")

    def capture_dashboard(self):
        """Captura del Dashboard Administrativo"""
        print("\n📊 Capturando Dashboard Administrativo...")
        self.driver.get(f"{BASE_URL}/")
        time.sleep(3)

        self.capture(
            "dashboard-main.png",
            "dashboard-main",
            "Vista principal del dashboard administrativo con métricas en tiempo real",
            ["admin", "dashboard", "estadísticas"],
            "dashboard"
        )

        self.capture(
            "dashboard-metrics.png",
            "dashboard-metrics",
            "Métricas detalladas del dashboard incluyendo cola, tiempos y flebotomistas",
            ["admin", "dashboard", "métricas"],
            "dashboard"
        )

    def capture_users(self):
        """Captura del Módulo de Usuarios"""
        print("\n👥 Capturando Gestión de Usuarios...")
        self.driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        self.capture(
            "users-list.png",
            "users-list",
            "Lista completa de usuarios del sistema con roles y estados",
            ["admin", "usuarios", "gestión"],
            "users"
        )

        # Scroll para ver más usuarios
        self.driver.execute_script("window.scrollTo(0, 400)")
        time.sleep(1)

        self.capture(
            "users-details.png",
            "users-details",
            "Vista detallada de usuarios mostrando información de roles y permisos",
            ["admin", "usuarios", "detalles"],
            "users"
        )

    def capture_atencion(self):
        """Captura del Módulo de Atención"""
        print("\n🩺 Capturando Módulo de Atención...")
        self.driver.get(f"{BASE_URL}/turns/attention")
        time.sleep(3)

        self.capture(
            "atencion-main.png",
            "atencion-main",
            "Interfaz principal de atención de pacientes para flebotomistas",
            ["atención", "pacientes", "flebotomista"],
            "atencion"
        )

        # Scroll para ver el sidebar
        self.driver.execute_script("window.scrollTo(0, 300)")
        time.sleep(1)

        self.capture(
            "atencion-sidebar.png",
            "atencion-sidebar",
            "Sidebar de atención mostrando pacientes sugeridos y cola",
            ["atención", "sidebar", "pacientes"],
            "atencion"
        )

        # Captura de botones de acción
        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

        self.capture(
            "atencion-actions.png",
            "atencion-actions",
            "Botones de acción para llamar, atender y gestionar pacientes",
            ["atención", "acciones", "botones"],
            "atencion"
        )

    def capture_cola(self):
        """Captura del Módulo de Cola"""
        print("\n📋 Capturando Gestión de Cola...")
        self.driver.get(f"{BASE_URL}/turns/queue")
        time.sleep(3)

        self.capture(
            "cola-main.png",
            "cola-main",
            "Cola pública mostrando pacientes en espera ordenados por prioridad",
            ["turnos", "cola", "pacientes"],
            "cola"
        )

        # Scroll para ver más pacientes
        self.driver.execute_script("window.scrollTo(0, 400)")
        time.sleep(1)

        self.capture(
            "cola-priority.png",
            "cola-priority",
            "Vista de cola mostrando iconos de prioridad y estados de pacientes",
            ["cola", "prioridad", "iconos"],
            "cola"
        )

    def capture_estadisticas(self):
        """Captura del Módulo de Estadísticas"""
        print("\n📈 Capturando Módulo de Estadísticas...")

        # Dashboard de estadísticas
        self.driver.get(f"{BASE_URL}/statistics")
        time.sleep(3)
        self.capture(
            "estadisticas-dashboard.png",
            "estadisticas-dashboard",
            "Dashboard principal de estadísticas con métricas generales",
            ["estadísticas", "dashboard", "métricas"],
            "estadisticas"
        )

        # Estadísticas diarias
        self.driver.get(f"{BASE_URL}/statistics/daily")
        time.sleep(3)
        self.capture(
            "estadisticas-daily.png",
            "estadisticas-daily",
            "Estadísticas diarias con gráficas de pacientes atendidos por día",
            ["estadísticas", "diarias", "gráficas"],
            "estadisticas"
        )

        # Estadísticas mensuales
        self.driver.get(f"{BASE_URL}/statistics/monthly")
        time.sleep(3)
        self.capture(
            "estadisticas-monthly.png",
            "estadisticas-monthly",
            "Estadísticas mensuales mostrando tendencias y comparativas",
            ["estadísticas", "mensuales", "tendencias"],
            "estadisticas"
        )

        # Rendimiento de flebotomistas
        self.driver.get(f"{BASE_URL}/statistics/phlebotomists")
        time.sleep(3)
        self.capture(
            "estadisticas-phlebotomists.png",
            "estadisticas-phlebotomists",
            "Rendimiento individual de flebotomistas con métricas de productividad",
            ["estadísticas", "flebotomistas", "rendimiento"],
            "estadisticas"
        )

        # Tiempo promedio
        self.driver.get(f"{BASE_URL}/statistics/average-time")
        time.sleep(3)
        self.capture(
            "estadisticas-time.png",
            "estadisticas-time",
            "Análisis de tiempo promedio de atención por paciente",
            ["estadísticas", "tiempo", "promedio"],
            "estadisticas"
        )

    def capture_cubiculos(self):
        """Captura del Módulo de Cubículos"""
        print("\n🏥 Capturando Gestión de Cubículos...")
        self.driver.get(f"{BASE_URL}/cubicles")
        time.sleep(3)

        self.capture(
            "cubiculos-list.png",
            "cubiculos-list",
            "Gestión de cubículos mostrando cubículos generales y especiales",
            ["admin", "cubículos", "gestión"],
            "cubiculos"
        )

        # Scroll para ver más cubículos
        self.driver.execute_script("window.scrollTo(0, 300)")
        time.sleep(1)

        self.capture(
            "cubiculos-types.png",
            "cubiculos-types",
            "Vista de tipos de cubículos con indicadores visuales",
            ["cubículos", "tipos", "visual"],
            "cubiculos"
        )

    def capture_turnos(self):
        """Captura del Módulo de Turnos"""
        print("\n🎫 Capturando Creación de Turnos...")
        self.driver.get(f"{BASE_URL}/turns")
        time.sleep(3)

        self.capture(
            "turnos-form.png",
            "turnos-form",
            "Formulario para crear nuevos turnos de pacientes",
            ["turnos", "crear", "formulario"],
            "turnos"
        )

        # Scroll para ver campos completos
        self.driver.execute_script("window.scrollTo(0, 400)")
        time.sleep(1)

        self.capture(
            "turnos-details.png",
            "turnos-details",
            "Vista detallada del formulario mostrando todos los campos requeridos",
            ["turnos", "formulario", "detalles"],
            "turnos"
        )

    def save_metadata(self):
        """Guarda metadata de screenshots"""
        metadata_file = os.path.join(SCREENSHOT_DIR, "screenshots-metadata.json")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.screenshots, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Metadata guardada: {metadata_file}")

    def run(self):
        """Ejecuta captura de todos los módulos"""
        try:
            self.login()

            # Capturar cada módulo
            self.capture_dashboard()
            self.capture_users()
            self.capture_atencion()
            self.capture_cola()
            self.capture_estadisticas()
            self.capture_cubiculos()
            self.capture_turnos()

            # Guardar metadata
            self.save_metadata()

            # Resumen
            total_size = sum(float(s['size'].replace(' KB', '')) for s in self.screenshots)
            print(f"\n✅ Captura completada!")
            print(f"📊 Total screenshots: {len(self.screenshots)}")
            print(f"💾 Tamaño total: {total_size:.1f} KB ({total_size/1024:.2f} MB)")

            # Resumen por módulo
            print("\n📁 Screenshots por módulo:")
            modules = {}
            for s in self.screenshots:
                mid = s['moduleId']
                modules[mid] = modules.get(mid, 0) + 1

            for module, count in sorted(modules.items()):
                print(f"  • {module}: {count} screenshots")

        finally:
            self.driver.quit()

if __name__ == "__main__":
    print("🚀 Iniciando captura de screenshots de todos los módulos...")
    print(f"📂 Guardando en: {SCREENSHOT_DIR}\n")

    capturer = ModuleScreenshotCapture()
    capturer.run()

    print("\n🎉 ¡Proceso completado!")
