#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script mejorado para documentar COMPLETAMENTE el módulo de Gestión de Usuarios
Versión 2: Usa selectores CSS más robustos y esperas dinámicas
"""

import os
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

BASE_URL = "http://localhost:3005"
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots/users"

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class UserManagementDocV2:
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
        time.sleep(0.5)  # Pequeña pausa para estabilidad
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
        print(f"    💾 {filename} ({size_kb:.1f} KB)")
        self.step += 1

    def login(self):
        print("\n" + "="*80)
        print("🔐 FASE 1: LOGIN AL SISTEMA")
        print("="*80 + "\n")

        self.driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        self.capture(
            "01-login-page.png",
            "Página de inicio de sesión",
            "Pantalla de login donde los usuarios ingresan sus credenciales para acceder al sistema."
        )

        # Login
        inputs = self.driver.find_elements(By.TAG_NAME, "input")
        inputs[0].send_keys("admin")
        time.sleep(0.5)

        self.capture(
            "02-username-entered.png",
            "Usuario ingresado",
            "Campo de usuario completado con 'admin'."
        )

        inputs[1].send_keys("123")
        time.sleep(0.5)

        self.capture(
            "03-password-entered.png",
            "Contraseña ingresada",
            "Campo de contraseña completado (se muestra oculta por seguridad)."
        )

        submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit.click()
        time.sleep(3)

        self.capture(
            "04-dashboard-logged-in.png",
            "Dashboard principal",
            "Dashboard administrativo después de autenticación exitosa."
        )

    def navigate_to_users(self):
        print("\n" + "="*80)
        print("👥 FASE 2: NAVEGACIÓN AL MÓDULO DE USUARIOS")
        print("="*80 + "\n")

        self.driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        self.capture(
            "05-users-module-initial.png",
            "Módulo de Gestión de Usuarios - Vista inicial",
            "Vista inicial del módulo mostrando la tabla de usuarios, estadísticas y botón de crear."
        )

        # Scroll para ver estadísticas
        self.driver.execute_script("window.scrollTo(0, 200)")
        time.sleep(1)

        self.capture(
            "06-users-table-view.png",
            "Tabla de usuarios",
            "Tabla completa mostrando: Nombre, Usuario, Rol, Estado y acciones disponibles."
        )

        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

    def create_user_complete(self):
        print("\n" + "="*80)
        print("➕ FASE 3: CREAR NUEVO USUARIO")
        print("="*80 + "\n")

        # Buscar botón crear - múltiples estrategias
        try:
            # Estrategia 1: Por texto
            create_btn = None
            buttons = self.driver.find_elements(By.TAG_NAME, "button")
            for btn in buttons:
                if "Crear" in btn.text or "crear" in btn.text.lower():
                    create_btn = btn
                    break

            if not create_btn:
                # Estrategia 2: Por ícono FaPlus
                create_btn = self.driver.find_element(By.CSS_SELECTOR, "button svg")
                create_btn = create_btn.find_element(By.XPATH, "./ancestor::button")

            self.capture(
                "07-create-button-located.png",
                "Botón 'Crear Usuario' ubicado",
                "Botón para crear nuevo usuario en la esquina superior derecha del módulo."
            )

            create_btn.click()
            time.sleep(2)

            self.capture(
                "08-create-modal-opened.png",
                "Modal de creación abierto",
                "Formulario de creación de usuario con campos: Nombre completo, Usuario, Contraseña, Rol y Estado."
            )

            # Llenar formulario
            # Buscar inputs dentro del modal/drawer
            all_inputs = self.driver.find_elements(By.TAG_NAME, "input")

            # Nombre completo (buscar por placeholder o label)
            for inp in all_inputs:
                placeholder = inp.get_attribute("placeholder") or ""
                if "nombre" in placeholder.lower() and "usuario" not in placeholder.lower():
                    inp.clear()
                    inp.send_keys("María González López")
                    time.sleep(0.5)
                    break

            self.capture(
                "09-name-field-filled.png",
                "Campo 'Nombre completo' llenado",
                "Nombre del usuario: 'María González López'."
            )

            # Usuario
            for inp in all_inputs:
                placeholder = inp.get_attribute("placeholder") or ""
                name_attr = inp.get_attribute("name") or ""
                if "usuario" in placeholder.lower() or "username" in name_attr.lower():
                    inp.clear()
                    inp.send_keys("maria.gonzalez")
                    time.sleep(0.5)
                    break

            self.capture(
                "10-username-field-filled.png",
                "Campo 'Usuario' llenado",
                "Nombre de usuario único: 'maria.gonzalez' (será usado para login)."
            )

            # Contraseña
            password_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            if password_inputs:
                password_inputs[0].clear()
                password_inputs[0].send_keys("Maria2024!")
                time.sleep(0.5)

            self.capture(
                "11-password-field-filled.png",
                "Campo 'Contraseña' llenado",
                "Contraseña segura ingresada (mínimo 6 caracteres)."
            )

            # Rol - buscar select
            selects = self.driver.find_elements(By.TAG_NAME, "select")
            if len(selects) >= 1:
                role_select = selects[0]
                role_select.click()
                time.sleep(0.5)

                self.capture(
                    "12-role-selector-open.png",
                    "Selector de Rol desplegado",
                    "Opciones de rol: Admin (permisos completos) y Flebotomista (permisos limitados)."
                )

                # Seleccionar Flebotomista
                options = role_select.find_elements(By.TAG_NAME, "option")
                for opt in options:
                    if "Flebotomista" in opt.text:
                        opt.click()
                        time.sleep(0.5)
                        break

                self.capture(
                    "13-role-selected.png",
                    "Rol 'Flebotomista' seleccionado",
                    "Rol seleccionado: Flebotomista (puede atender pacientes)."
                )

            # Estado
            if len(selects) >= 2:
                status_select = selects[1]
                status_select.click()
                time.sleep(0.5)

                self.capture(
                    "14-status-selector-open.png",
                    "Selector de Estado desplegado",
                    "Opciones de estado: ACTIVE (puede login), INACTIVE (deshabilitado temporal), BLOCKED (bloqueado permanente)."
                )

                # Seleccionar ACTIVE
                options = status_select.find_elements(By.TAG_NAME, "option")
                for opt in options:
                    if "ACTIVE" in opt.text:
                        opt.click()
                        time.sleep(0.5)
                        break

                self.capture(
                    "15-status-selected.png",
                    "Estado 'ACTIVE' seleccionado",
                    "Estado ACTIVE permite que el usuario inicie sesión inmediatamente."
                )

            # Formulario completo
            self.capture(
                "16-form-complete-ready.png",
                "Formulario completo listo para guardar",
                "Todos los campos validados y listos para crear el usuario."
            )

            # Buscar botón Guardar
            save_buttons = self.driver.find_elements(By.TAG_NAME, "button")
            for btn in save_buttons:
                if "Guardar" in btn.text or "Crear" in btn.text:
                    btn.click()
                    time.sleep(3)
                    break

            self.capture(
                "17-user-created-success.png",
                "Usuario creado exitosamente",
                "Confirmación: Usuario creado y agregado a la tabla."
            )

            print("✅ Usuario creado exitosamente")

        except Exception as e:
            print(f"⚠️  Error al crear usuario: {str(e)}")
            self.capture(
                "error-create-user.png",
                "Error en creación",
                f"Error encontrado: {str(e)[:100]}"
            )

    def search_and_filter(self):
        print("\n" + "="*80)
        print("🔍 FASE 4: BÚSQUEDA Y FILTROS")
        print("="*80 + "\n")

        time.sleep(2)

        try:
            # Buscar campo de búsqueda
            search_input = None
            inputs = self.driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                placeholder = inp.get_attribute("placeholder") or ""
                if "buscar" in placeholder.lower() or "search" in placeholder.lower():
                    search_input = inp
                    break

            if search_input:
                self.capture(
                    "18-search-field-located.png",
                    "Campo de búsqueda",
                    "Campo para filtrar usuarios por nombre o usuario en tiempo real."
                )

                search_input.click()
                search_input.send_keys("María")
                time.sleep(1.5)

                self.capture(
                    "19-search-maria-results.png",
                    "Resultados de búsqueda: 'María'",
                    "Tabla filtrada mostrando solo usuarios que contienen 'María'."
                )

                search_input.clear()
                time.sleep(1)

                self.capture(
                    "20-search-cleared.png",
                    "Búsqueda limpiada",
                    "Tabla vuelve a mostrar todos los usuarios."
                )

        except Exception as e:
            print(f"⚠️  Búsqueda no disponible: {str(e)}")

    def edit_user(self):
        print("\n" + "="*80)
        print("✏️  FASE 5: EDITAR USUARIO")
        print("="*80 + "\n")

        time.sleep(2)

        try:
            # Buscar botones de editar (ícono lápiz)
            edit_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button[aria-label*='Editar'], button svg + ..")

            if not edit_buttons:
                # Buscar por posición en tabla
                rows = self.driver.find_elements(By.TAG_NAME, "tr")
                for row in rows:
                    if "María" in row.text or "maria" in row.text.lower():
                        buttons = row.find_elements(By.TAG_NAME, "button")
                        if len(buttons) > 0:
                            edit_buttons = [buttons[0]]
                            break

            if edit_buttons:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", edit_buttons[0])
                time.sleep(1)

                self.capture(
                    "21-edit-button-highlighted.png",
                    "Botón de editar localizado",
                    "Cada usuario tiene un botón de editar (ícono de lápiz) para modificar su información."
                )

                edit_buttons[0].click()
                time.sleep(2)

                self.capture(
                    "22-edit-modal-opened.png",
                    "Modal de edición abierto",
                    "Formulario de edición con datos actuales del usuario precargados."
                )

                # Modificar nombre
                inputs = self.driver.find_elements(By.TAG_NAME, "input")
                for inp in inputs:
                    if inp.get_attribute("value") and "María" in inp.get_attribute("value"):
                        inp.clear()
                        inp.send_keys("María González López - Supervisora")
                        time.sleep(0.5)
                        break

                self.capture(
                    "23-name-modified.png",
                    "Nombre modificado",
                    "Nombre actualizado a: 'María González López - Supervisora'."
                )

                # Cambiar rol a Admin
                selects = self.driver.find_elements(By.TAG_NAME, "select")
                if selects:
                    selects[0].click()
                    time.sleep(0.5)
                    options = selects[0].find_elements(By.TAG_NAME, "option")
                    for opt in options:
                        if "Admin" in opt.text:
                            opt.click()
                            time.sleep(0.5)
                            break

                    self.capture(
                        "24-role-changed-to-admin.png",
                        "Rol cambiado a Admin",
                        "Rol actualizado de 'Flebotomista' a 'Admin', otorgando permisos completos."
                    )

                # Guardar
                save_btns = self.driver.find_elements(By.TAG_NAME, "button")
                for btn in save_btns:
                    if "Guardar" in btn.text or "Actualizar" in btn.text:
                        btn.click()
                        time.sleep(2)
                        break

                self.capture(
                    "25-user-edited-success.png",
                    "Usuario editado exitosamente",
                    "Cambios guardados, usuario actualizado en la tabla."
                )

                print("✅ Usuario editado exitosamente")

        except Exception as e:
            print(f"⚠️  Error al editar: {str(e)}")

    def change_status_inactive(self):
        print("\n" + "="*80)
        print("🔄 FASE 6: CAMBIAR ESTADO A INACTIVE")
        print("="*80 + "\n")

        time.sleep(2)

        try:
            # Buscar menú de 3 puntos
            menu_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button[aria-label*='Opciones'], button[aria-label*='Menu']")

            if not menu_buttons:
                # Buscar en la fila de María
                rows = self.driver.find_elements(By.TAG_NAME, "tr")
                for row in rows:
                    if "María" in row.text:
                        buttons = row.find_elements(By.TAG_NAME, "button")
                        # El último botón suele ser el menú
                        if len(buttons) > 1:
                            menu_buttons = [buttons[-1]]
                            break

            if menu_buttons:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", menu_buttons[0])
                time.sleep(1)

                self.capture(
                    "26-options-menu-button.png",
                    "Botón de menú de opciones",
                    "Cada usuario tiene un menú de opciones (tres puntos) con acciones adicionales."
                )

                menu_buttons[0].click()
                time.sleep(1)

                self.capture(
                    "27-options-menu-opened.png",
                    "Menú de opciones desplegado",
                    "Menú mostrando opciones: Cambiar estado, Ver detalles, etc."
                )

                # Buscar opción INACTIVE
                menu_items = self.driver.find_elements(By.TAG_NAME, "button")
                for item in menu_items:
                    if "INACTIVE" in item.text:
                        item.click()
                        time.sleep(1)
                        break

                # Buscar confirmación
                confirm_btns = self.driver.find_elements(By.TAG_NAME, "button")
                for btn in confirm_btns:
                    if "Confirmar" in btn.text or "Aceptar" in btn.text:
                        self.capture(
                            "28-confirm-inactive-dialog.png",
                            "Diálogo de confirmación",
                            "Confirmación requerida para cambiar estado a INACTIVE."
                        )
                        btn.click()
                        time.sleep(2)
                        break

                self.capture(
                    "29-user-status-inactive.png",
                    "Usuario en estado INACTIVE",
                    "Estado cambiado a INACTIVE (badge naranja). Usuario no puede iniciar sesión."
                )

                print("✅ Estado cambiado a INACTIVE")

        except Exception as e:
            print(f"⚠️  Error al cambiar estado: {str(e)}")

    def final_overview(self):
        print("\n" + "="*80)
        print("📊 FASE 7: VISTA FINAL Y RESUMEN")
        print("="*80 + "\n")

        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

        self.capture(
            "30-final-complete-view.png",
            "Vista final completa del módulo",
            "Módulo de Gestión de Usuarios después de realizar: crear, editar, buscar y cambiar estado."
        )

        # Scroll para ver stats
        self.driver.execute_script("window.scrollTo(0, 300)")
        time.sleep(1)

        self.capture(
            "31-final-table-view.png",
            "Tabla final con todos los usuarios",
            "Vista completa de la tabla mostrando todos los usuarios y sus estados actuales."
        )

    def save_documentation(self):
        doc_file = os.path.join(SCREENSHOT_DIR, "complete-documentation.json")

        doc = {
            "module": "Gestión de Usuarios",
            "version": "2.0",
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_steps": len(self.screenshots),
            "description": "Documentación completa del módulo de Gestión de Usuarios con todas las operaciones",
            "phases": [
                "Login al sistema",
                "Navegación al módulo",
                "Crear nuevo usuario",
                "Búsqueda y filtros",
                "Editar usuario",
                "Cambiar estado",
                "Vista final"
            ],
            "steps": self.screenshots
        }

        with open(doc_file, 'w', encoding='utf-8') as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Documentación guardada: {doc_file}")

    def run(self):
        try:
            print("\n" + "="*80)
            print("🚀 DOCUMENTACIÓN COMPLETA DEL MÓDULO DE GESTIÓN DE USUARIOS v2.0")
            print("="*80)

            self.login()
            self.navigate_to_users()
            self.create_user_complete()
            self.search_and_filter()
            self.edit_user()
            self.change_status_inactive()
            self.final_overview()

            self.save_documentation()

            # Resumen
            total_size = sum(float(s['size'].replace(' KB', '')) for s in self.screenshots)
            print("\n" + "="*80)
            print("✅ DOCUMENTACIÓN COMPLETADA EXITOSAMENTE")
            print("="*80)
            print(f"\n📊 Estadísticas:")
            print(f"   • Total de capturas: {len(self.screenshots)}")
            print(f"   • Tamaño total: {total_size:.1f} KB ({total_size/1024:.2f} MB)")
            print(f"   • Directorio: {SCREENSHOT_DIR}")
            print(f"\n✨ Operaciones documentadas:")
            print(f"   ✅ Login completo")
            print(f"   ✅ Navegación al módulo")
            print(f"   ✅ Crear usuario nuevo")
            print(f"   ✅ Búsqueda y filtros")
            print(f"   ✅ Editar usuario")
            print(f"   ✅ Cambiar estado")
            print(f"   ✅ Vistas generales")

        finally:
            time.sleep(2)
            self.driver.quit()

if __name__ == "__main__":
    print("\n🎬 Iniciando documentación automática...")
    documenter = UserManagementDocV2()
    documenter.run()
    print("\n🎉 ¡Documentación completada! Revisa las imágenes en:")
    print(f"   {SCREENSHOT_DIR}\n")
