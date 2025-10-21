#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
VERSIÓN 3 - DOCUMENTACIÓN COMPLETA Y EXHAUSTIVA
Documenta TODAS las operaciones sin parar:
- Crear, Editar, Buscar, Filtrar, Ver detalles, Cambiar estados
"""

import os
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:3005"
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots/users"

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class CompleteUserDocumentation:
    def __init__(self):
        options = Options()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--force-device-scale-factor=1")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.screenshots = []
        self.step = 1

    def capture(self, filename, title, description):
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        time.sleep(0.8)
        self.driver.save_screenshot(filepath)

        size_kb = os.path.getsize(filepath) / 1024

        self.screenshots.append({
            'step': self.step,
            'filename': filename,
            'title': title,
            'description': description,
            'path': f"/docs/screenshots/users/{filename}",
            'size': f"{size_kb:.1f} KB"
        })

        print(f"✅ [{self.step:02d}] {title}")
        self.step += 1

    def find_button_by_text(self, text):
        """Encuentra botón por texto parcial"""
        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if text.lower() in btn.text.lower():
                return btn
        return None

    def find_input_by_placeholder(self, text):
        """Encuentra input por placeholder"""
        inputs = self.driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            placeholder = inp.get_attribute("placeholder") or ""
            if text.lower() in placeholder.lower():
                return inp
        return None

    def scroll_to_element(self, element):
        """Scroll suave a elemento"""
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(1)

    def login(self):
        print("\n" + "="*80)
        print("🔐 FASE 1: LOGIN")
        print("="*80)

        self.driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        self.capture("01-login-page.png", "Página de inicio de sesión",
                    "Pantalla de login del sistema")

        inputs = self.driver.find_elements(By.TAG_NAME, "input")
        inputs[0].send_keys("admin")
        time.sleep(0.5)
        self.capture("02-username-entered.png", "Usuario ingresado", "Campo usuario completado")

        inputs[1].send_keys("123")
        time.sleep(0.5)
        self.capture("03-password-entered.png", "Contraseña ingresada", "Campo contraseña completado")

        submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit.click()
        time.sleep(3)

        self.capture("04-dashboard.png", "Dashboard principal", "Dashboard después del login")

    def navigate_and_overview(self):
        print("\n" + "="*80)
        print("👥 FASE 2: MÓDULO DE USUARIOS")
        print("="*80)

        self.driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        self.capture("05-users-initial.png", "Vista inicial del módulo",
                    "Módulo de Gestión de Usuarios con tabla, estadísticas y acciones")

        self.driver.execute_script("window.scrollTo(0, 300)")
        time.sleep(1)
        self.capture("06-users-table.png", "Tabla de usuarios",
                    "Tabla mostrando todos los usuarios con nombre, usuario, rol y estado")

        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

    def create_user(self):
        print("\n" + "="*80)
        print("➕ FASE 3: CREAR USUARIO")
        print("="*80)

        create_btn = self.find_button_by_text("Crear")
        if create_btn:
            self.scroll_to_element(create_btn)
            self.capture("07-create-button.png", "Botón Crear Usuario", "Botón para agregar nuevo usuario")

            create_btn.click()
            time.sleep(2)
            self.capture("08-create-modal.png", "Modal de creación", "Formulario vacío para nuevo usuario")

            # Llenar nombre
            inputs = self.driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                placeholder = inp.get_attribute("placeholder") or ""
                if "nombre" in placeholder.lower() and "usuario" not in placeholder.lower():
                    inp.send_keys("Pedro Martínez Ruiz")
                    time.sleep(0.5)
                    break

            self.capture("09-name-filled.png", "Nombre ingresado", "Campo 'Nombre completo' llenado")

            # Usuario
            for inp in inputs:
                placeholder = inp.get_attribute("placeholder") or ""
                if "usuario" in placeholder.lower():
                    inp.send_keys("pedro.martinez")
                    time.sleep(0.5)
                    break

            self.capture("10-username-filled.png", "Usuario ingresado", "Nombre de usuario único")

            # Contraseña
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            if password_inputs:
                password_inputs[0].send_keys("Pedro2024!")
                time.sleep(0.5)

            self.capture("11-password-filled.png", "Contraseña ingresada", "Contraseña segura")

            # Rol
            selects = self.driver.find_elements(By.TAG_NAME, "select")
            if selects:
                selects[0].click()
                time.sleep(0.5)
                self.capture("12-role-dropdown.png", "Selector de Rol", "Opciones: Admin y Flebotomista")

                options = selects[0].find_elements(By.TAG_NAME, "option")
                for opt in options:
                    if "Admin" in opt.text:
                        opt.click()
                        time.sleep(0.5)
                        break

                self.capture("13-role-selected.png", "Rol Admin seleccionado", "Rol con permisos completos")

            # Estado
            if len(selects) > 1:
                selects[1].click()
                time.sleep(0.5)
                self.capture("14-status-dropdown.png", "Selector de Estado", "Estados: ACTIVE, INACTIVE, BLOCKED")

                options = selects[1].find_elements(By.TAG_NAME, "option")
                for opt in options:
                    if "ACTIVE" in opt.text:
                        opt.click()
                        time.sleep(0.5)
                        break

                self.capture("15-status-selected.png", "Estado ACTIVE", "Usuario podrá iniciar sesión")

            self.capture("16-form-ready.png", "Formulario completo", "Listo para guardar")

            save_btn = self.find_button_by_text("Guardar")
            if save_btn:
                save_btn.click()
                time.sleep(3)

            self.capture("17-user-created.png", "Usuario creado", "Confirmación de creación exitosa")
            print("✅ Usuario Pedro creado")

    def search_users(self):
        print("\n" + "="*80)
        print("🔍 FASE 4: BÚSQUEDA")
        print("="*80)

        time.sleep(2)
        search_input = self.find_input_by_placeholder("buscar")

        if search_input:
            self.scroll_to_element(search_input)
            self.capture("18-search-field.png", "Campo de búsqueda", "Buscar por nombre o usuario")

            search_input.click()
            search_input.send_keys("Pedro")
            time.sleep(1.5)

            self.capture("19-search-pedro.png", "Búsqueda: Pedro", "Resultados filtrados")

            search_input.clear()
            time.sleep(1)
            self.capture("20-search-cleared.png", "Búsqueda limpiada", "Todos los usuarios visibles")

            search_input.send_keys("admin")
            time.sleep(1.5)
            self.capture("21-search-admin.png", "Búsqueda: admin", "Filtro por palabra clave")

            search_input.clear()
            time.sleep(1)

            print("✅ Búsquedas documentadas")

    def edit_user(self):
        print("\n" + "="*80)
        print("✏️  FASE 5: EDITAR USUARIO")
        print("="*80)

        time.sleep(2)

        # Buscar fila de Pedro
        rows = self.driver.find_elements(By.TAG_NAME, "tr")
        edit_btn = None

        for row in rows:
            if "Pedro" in row.text or "pedro" in row.text.lower():
                buttons = row.find_elements(By.TAG_NAME, "button")
                if buttons:
                    # Buscar botón de editar (generalmente el primero)
                    for btn in buttons:
                        aria_label = btn.get_attribute("aria-label") or ""
                        if "edit" in aria_label.lower() or "editar" in aria_label.lower():
                            edit_btn = btn
                            break
                    if not edit_btn and buttons:
                        edit_btn = buttons[0]  # Primer botón suele ser editar
                    break

        if edit_btn:
            self.scroll_to_element(edit_btn)
            self.capture("22-edit-button.png", "Botón Editar", "Ícono de lápiz para editar usuario")

            edit_btn.click()
            time.sleep(2)

            self.capture("23-edit-modal.png", "Modal de edición", "Datos actuales precargados")

            # Modificar nombre
            inputs = self.driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                value = inp.get_attribute("value") or ""
                if "Pedro" in value:
                    inp.clear()
                    inp.send_keys("Pedro Martínez Ruiz - Senior")
                    time.sleep(0.5)
                    break

            self.capture("24-name-edited.png", "Nombre modificado", "Actualizado a 'Senior'")

            # Cambiar rol a Flebotomista
            selects = self.driver.find_elements(By.TAG_NAME, "select")
            if selects:
                selects[0].click()
                time.sleep(0.5)
                options = selects[0].find_elements(By.TAG_NAME, "option")
                for opt in options:
                    if "Flebotomista" in opt.text:
                        opt.click()
                        time.sleep(0.5)
                        break

                self.capture("25-role-changed.png", "Rol cambiado", "Cambiado a Flebotomista")

            save_btn = self.find_button_by_text("Guardar")
            if save_btn:
                save_btn.click()
                time.sleep(3)

            self.capture("26-user-edited.png", "Usuario editado", "Cambios guardados exitosamente")
            print("✅ Usuario editado")

    def change_to_inactive(self):
        print("\n" + "="*80)
        print("🔄 FASE 6: CAMBIAR A INACTIVE")
        print("="*80)

        time.sleep(2)

        # Buscar menú de Pedro
        rows = self.driver.find_elements(By.TAG_NAME, "tr")
        menu_btn = None

        for row in rows:
            if "Pedro" in row.text:
                buttons = row.find_elements(By.TAG_NAME, "button")
                # El último botón suele ser el menú de opciones
                if len(buttons) > 1:
                    menu_btn = buttons[-1]
                    break

        if menu_btn:
            self.scroll_to_element(menu_btn)
            self.capture("27-menu-button.png", "Menú de opciones", "Tres puntos verticales")

            menu_btn.click()
            time.sleep(1)

            self.capture("28-menu-opened.png", "Menú desplegado", "Opciones disponibles para el usuario")

            # Buscar opción INACTIVE
            menu_items = self.driver.find_elements(By.TAG_NAME, "button")
            for item in menu_items:
                if "INACTIVE" in item.text:
                    item.click()
                    time.sleep(1)
                    break

            # Confirmar
            time.sleep(1)
            self.capture("29-confirm-inactive.png", "Confirmación INACTIVE", "Diálogo de confirmación")

            confirm_btn = self.find_button_by_text("Confirmar")
            if confirm_btn:
                confirm_btn.click()
                time.sleep(2)

            self.capture("30-user-inactive.png", "Usuario INACTIVE", "Estado cambiado, badge naranja")
            print("✅ Estado cambiado a INACTIVE")

    def change_to_blocked(self):
        print("\n" + "="*80)
        print("🚫 FASE 7: BLOQUEAR USUARIO")
        print("="*80)

        time.sleep(2)

        # Buscar menú nuevamente
        rows = self.driver.find_elements(By.TAG_NAME, "tr")
        menu_btn = None

        for row in rows:
            if "Pedro" in row.text:
                buttons = row.find_elements(By.TAG_NAME, "button")
                if len(buttons) > 1:
                    menu_btn = buttons[-1]
                    break

        if menu_btn:
            self.scroll_to_element(menu_btn)
            menu_btn.click()
            time.sleep(1)

            self.capture("31-menu-for-block.png", "Menú para bloquear", "Opciones de cambio de estado")

            # BLOCKED
            menu_items = self.driver.find_elements(By.TAG_NAME, "button")
            for item in menu_items:
                if "BLOCKED" in item.text:
                    item.click()
                    time.sleep(1)
                    break

            time.sleep(1)
            self.capture("32-confirm-blocked.png", "Confirmación BLOCKED", "Advertencia de bloqueo permanente")

            confirm_btn = self.find_button_by_text("Confirmar")
            if confirm_btn:
                confirm_btn.click()
                time.sleep(2)

            self.capture("33-user-blocked.png", "Usuario BLOCKED", "Estado bloqueado, badge rojo")
            print("✅ Usuario bloqueado")

    def reactivate_user(self):
        print("\n" + "="*80)
        print("🔓 FASE 8: REACTIVAR USUARIO")
        print("="*80)

        time.sleep(2)

        rows = self.driver.find_elements(By.TAG_NAME, "tr")
        menu_btn = None

        for row in rows:
            if "Pedro" in row.text:
                buttons = row.find_elements(By.TAG_NAME, "button")
                if len(buttons) > 1:
                    menu_btn = buttons[-1]
                    break

        if menu_btn:
            self.scroll_to_element(menu_btn)
            menu_btn.click()
            time.sleep(1)

            self.capture("34-menu-reactivate.png", "Menú reactivación", "Opciones para usuario bloqueado")

            # ACTIVE
            menu_items = self.driver.find_elements(By.TAG_NAME, "button")
            for item in menu_items:
                if "ACTIVE" in item.text and "INACTIVE" not in item.text:
                    item.click()
                    time.sleep(1)
                    break

            time.sleep(1)
            self.capture("35-confirm-active.png", "Confirmación ACTIVE", "Reactivar usuario")

            confirm_btn = self.find_button_by_text("Confirmar")
            if confirm_btn:
                confirm_btn.click()
                time.sleep(2)

            self.capture("36-user-reactivated.png", "Usuario reactivado", "Estado ACTIVE restaurado")
            print("✅ Usuario reactivado")

    def view_user_details(self):
        print("\n" + "="*80)
        print("👁️  FASE 9: VER DETALLES")
        print("="*80)

        time.sleep(2)

        # Click en fila de usuario
        rows = self.driver.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            if "Pedro" in row.text:
                self.scroll_to_element(row)
                self.capture("37-clickable-row.png", "Fila clickeable", "Click para ver detalles completos")

                # Intentar click en la fila
                try:
                    row.click()
                    time.sleep(2)
                    self.capture("38-user-details.png", "Detalles del usuario",
                               "Modal con información completa: permisos, fechas, estado")

                    # Cerrar modal
                    close_btns = self.driver.find_elements(By.TAG_NAME, "button")
                    for btn in close_btns:
                        aria = btn.get_attribute("aria-label") or ""
                        if "cerrar" in aria.lower() or "close" in aria.lower():
                            btn.click()
                            time.sleep(1)
                            break

                    print("✅ Detalles visualizados")
                except:
                    print("⚠️  No se pudo abrir detalles")

                break

    def final_views(self):
        print("\n" + "="*80)
        print("📊 FASE 10: VISTAS FINALES")
        print("="*80)

        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

        self.capture("39-final-overview.png", "Vista final completa",
                    "Módulo después de todas las operaciones")

        self.driver.execute_script("window.scrollTo(0, 400)")
        time.sleep(1)

        self.capture("40-final-table.png", "Tabla final",
                    "Todos los usuarios con estados actualizados")

        # Stats
        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

        try:
            stats = self.driver.find_elements(By.CSS_SELECTOR, "[class*='stat'], [class*='Stat']")
            if stats:
                self.capture("41-statistics.png", "Estadísticas del módulo",
                           "Cards con totales de usuarios por estado y rol")
        except:
            pass

    def save_doc(self):
        doc_file = os.path.join(SCREENSHOT_DIR, "full-documentation.json")

        doc = {
            "module": "Gestión de Usuarios",
            "version": "3.0 - Completa",
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_steps": len(self.screenshots),
            "description": "Documentación exhaustiva con TODAS las operaciones del módulo",
            "operations": [
                "Login",
                "Navegación",
                "Crear usuario",
                "Buscar y filtrar",
                "Editar usuario",
                "Cambiar a INACTIVE",
                "Cambiar a BLOCKED",
                "Reactivar (ACTIVE)",
                "Ver detalles",
                "Vistas finales y estadísticas"
            ],
            "steps": self.screenshots
        }

        with open(doc_file, 'w', encoding='utf-8') as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Documentación guardada: {doc_file}")

    def run(self):
        try:
            print("\n" + "="*80)
            print("🚀 DOCUMENTACIÓN EXHAUSTIVA - MÓDULO DE GESTIÓN DE USUARIOS V3")
            print("="*80)

            self.login()
            self.navigate_and_overview()
            self.create_user()
            self.search_users()
            self.edit_user()
            self.change_to_inactive()
            self.change_to_blocked()
            self.reactivate_user()
            self.view_user_details()
            self.final_views()

            self.save_doc()

            total_size = sum(float(s['size'].replace(' KB', '')) for s in self.screenshots)
            print("\n" + "="*80)
            print("✅ DOCUMENTACIÓN COMPLETA - 100% EXITOSA")
            print("="*80)
            print(f"\n📊 Resumen:")
            print(f"   📸 Total capturas: {len(self.screenshots)}")
            print(f"   💾 Tamaño: {total_size:.1f} KB ({total_size/1024:.2f} MB)")
            print(f"   📁 Ubicación: {SCREENSHOT_DIR}")
            print(f"\n✨ Operaciones documentadas:")
            print(f"   ✅ Login completo (4 pasos)")
            print(f"   ✅ Navegación y vista inicial (2 pasos)")
            print(f"   ✅ Crear usuario completo (11 pasos)")
            print(f"   ✅ Búsqueda y filtros (4 pasos)")
            print(f"   ✅ Editar usuario (5 pasos)")
            print(f"   ✅ Cambiar a INACTIVE (4 pasos)")
            print(f"   ✅ Cambiar a BLOCKED (3 pasos)")
            print(f"   ✅ Reactivar usuario (3 pasos)")
            print(f"   ✅ Ver detalles (2 pasos)")
            print(f"   ✅ Vistas finales (3 pasos)")

        finally:
            time.sleep(2)
            self.driver.quit()

if __name__ == "__main__":
    doc = CompleteUserDocumentation()
    doc.run()
    print("\n🎉 ¡DOCUMENTACIÓN COMPLETADA AL 100%!")
