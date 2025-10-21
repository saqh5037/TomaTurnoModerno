#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para documentar COMPLETAMENTE el módulo de Gestión de Usuarios
Cubre: Crear, Editar, Ver detalles, Cambiar estado, Buscar, Filtrar
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

BASE_URL = "http://localhost:3005"
SCREENSHOT_DIR = "/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots/users"

# Asegurar que existe el directorio
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

class UserManagementDocumentation:
    def __init__(self):
        options = Options()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--force-device-scale-factor=1")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.screenshots = []
        self.step_number = 1

    def capture(self, filename, title, description):
        """Captura un screenshot con metadata detallada"""
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        self.driver.save_screenshot(filepath)

        file_size = os.path.getsize(filepath)
        size_kb = file_size / 1024

        self.screenshots.append({
            'step': self.step_number,
            'filename': filename,
            'title': title,
            'description': description,
            'path': f"/docs/screenshots/users/{filename}",
            'size': f"{size_kb:.1f} KB"
        })

        print(f"  [{self.step_number}] 📸 {title}")
        print(f"      {description}")
        print(f"      💾 {filename} ({size_kb:.1f} KB)\n")

        self.step_number += 1

    def login(self):
        """Login como admin"""
        print("\n🔐 === PASO 1: INICIO DE SESIÓN ===\n")
        self.driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        self.capture(
            "step01-login-page.png",
            "Página de inicio de sesión",
            "La página de login es el punto de entrada al sistema. Aquí los usuarios ingresan sus credenciales."
        )

        # Llenar formulario de login
        username_field = self.driver.find_elements(By.TAG_NAME, "input")[0]
        password_field = self.driver.find_elements(By.TAG_NAME, "input")[1]

        username_field.send_keys("admin")
        time.sleep(0.5)

        self.capture(
            "step02-username-entered.png",
            "Usuario ingresado",
            "Se ingresa el nombre de usuario 'admin' en el campo de usuario."
        )

        password_field.send_keys("123")
        time.sleep(0.5)

        self.capture(
            "step03-password-entered.png",
            "Contraseña ingresada",
            "Se ingresa la contraseña en el campo correspondiente (se muestra oculta por seguridad)."
        )

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        time.sleep(3)

        self.capture(
            "step04-dashboard-after-login.png",
            "Dashboard después del login",
            "Después de autenticarse exitosamente, el usuario es redirigido al dashboard principal del sistema."
        )

    def navigate_to_users(self):
        """Navegar al módulo de usuarios"""
        print("\n👥 === PASO 2: NAVEGACIÓN AL MÓDULO DE USUARIOS ===\n")

        self.driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        self.capture(
            "step05-users-list-initial.png",
            "Vista inicial del módulo de usuarios",
            "El módulo de Gestión de Usuarios muestra una tabla con todos los usuarios del sistema, incluyendo su nombre, usuario, rol y estado."
        )

        # Scroll para ver toda la tabla
        self.driver.execute_script("window.scrollTo(0, 300)")
        time.sleep(1)

        self.capture(
            "step06-users-list-scrolled.png",
            "Lista completa de usuarios",
            "Vista completa de la tabla de usuarios mostrando todos los campos: nombre completo, nombre de usuario, rol (Admin/Flebotomista) y estado (ACTIVE/INACTIVE/BLOCKED)."
        )

        # Volver arriba
        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

    def create_new_user_flow(self):
        """Flujo completo de creación de usuario"""
        print("\n➕ === PASO 3: CREAR NUEVO USUARIO ===\n")

        # Click en botón "Crear Usuario"
        try:
            create_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Crear Usuario')]"))
            )
            create_btn.click()
            time.sleep(2)

            self.capture(
                "step07-create-user-modal.png",
                "Modal de creación de usuario",
                "Al hacer clic en 'Crear Usuario', se abre un modal con el formulario para ingresar los datos del nuevo usuario."
            )

            # Llenar formulario paso a paso

            # 1. Nombre completo
            name_input = self.driver.find_element(By.ID, "name")
            name_input.send_keys("María González López")
            time.sleep(0.5)

            self.capture(
                "step08-name-entered.png",
                "Nombre completo ingresado",
                "Se ingresa el nombre completo del usuario: 'María González López'. Este campo es obligatorio."
            )

            # 2. Nombre de usuario
            username_input = self.driver.find_element(By.ID, "username")
            username_input.send_keys("maria.gonzalez")
            time.sleep(0.5)

            self.capture(
                "step09-username-entered.png",
                "Nombre de usuario ingresado",
                "Se ingresa el nombre de usuario único: 'maria.gonzalez'. Este será el usuario para iniciar sesión."
            )

            # 3. Contraseña
            password_input = self.driver.find_element(By.ID, "password")
            password_input.send_keys("Maria2024!")
            time.sleep(0.5)

            self.capture(
                "step10-password-entered.png",
                "Contraseña ingresada",
                "Se ingresa una contraseña segura para el usuario. Debe tener al menos 6 caracteres."
            )

            # 4. Seleccionar rol
            role_select = self.driver.find_element(By.ID, "role")
            role_select.click()
            time.sleep(0.5)

            self.capture(
                "step11-role-dropdown-open.png",
                "Selector de rol desplegado",
                "Se despliega el selector de rol mostrando las opciones: Admin y Flebotomista."
            )

            # Seleccionar Flebotomista
            flebotomista_option = self.driver.find_element(By.XPATH, "//option[@value='Flebotomista']")
            flebotomista_option.click()
            time.sleep(0.5)

            self.capture(
                "step12-role-selected.png",
                "Rol seleccionado: Flebotomista",
                "Se selecciona el rol 'Flebotomista' para este usuario. Los flebotomistas tienen permisos limitados para atención de pacientes."
            )

            # 5. Seleccionar estado
            status_select = self.driver.find_element(By.ID, "status")
            status_select.click()
            time.sleep(0.5)

            self.capture(
                "step13-status-dropdown-open.png",
                "Selector de estado desplegado",
                "Se despliega el selector de estado mostrando las opciones: ACTIVE, INACTIVE y BLOCKED."
            )

            # Seleccionar ACTIVE
            active_option = self.driver.find_element(By.XPATH, "//option[@value='ACTIVE']")
            active_option.click()
            time.sleep(0.5)

            self.capture(
                "step14-status-selected.png",
                "Estado seleccionado: ACTIVE",
                "Se selecciona el estado 'ACTIVE' para que el usuario pueda iniciar sesión inmediatamente."
            )

            # Formulario completo
            self.capture(
                "step15-form-complete.png",
                "Formulario completo listo para guardar",
                "Todos los campos del formulario están llenos y validados. Ahora se puede guardar el nuevo usuario."
            )

            # Click en guardar
            save_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Guardar')]")
            save_btn.click()
            time.sleep(2)

            self.capture(
                "step16-user-created-success.png",
                "Usuario creado exitosamente",
                "El sistema muestra un mensaje de confirmación y el nuevo usuario aparece en la lista."
            )

        except Exception as e:
            print(f"⚠️  Error en creación: {str(e)}")
            self.capture(
                "error-create-user.png",
                "Error en creación",
                f"Se encontró un error: {str(e)}"
            )

    def search_user_flow(self):
        """Flujo de búsqueda de usuario"""
        print("\n🔍 === PASO 4: BUSCAR USUARIO ===\n")

        time.sleep(2)

        # Buscar el campo de búsqueda
        try:
            search_input = self.driver.find_element(By.XPATH, "//input[@placeholder='Buscar por nombre o usuario...']")

            self.capture(
                "step17-search-field.png",
                "Campo de búsqueda",
                "El módulo incluye un campo de búsqueda para filtrar usuarios por nombre o nombre de usuario."
            )

            # Escribir en búsqueda
            search_input.send_keys("María")
            time.sleep(1)

            self.capture(
                "step18-search-results.png",
                "Resultados de búsqueda",
                "Al escribir 'María', la tabla se filtra automáticamente mostrando solo los usuarios que coinciden con el criterio."
            )

            # Limpiar búsqueda
            search_input.clear()
            time.sleep(1)

        except Exception as e:
            print(f"⚠️  No se encontró campo de búsqueda: {str(e)}")

    def edit_user_flow(self):
        """Flujo completo de edición de usuario"""
        print("\n✏️  === PASO 5: EDITAR USUARIO ===\n")

        time.sleep(2)

        try:
            # Buscar botón de editar (primer usuario de María)
            edit_buttons = self.driver.find_elements(By.XPATH, "//button[contains(@aria-label, 'Editar')]")

            if len(edit_buttons) > 0:
                # Scroll al botón
                self.driver.execute_script("arguments[0].scrollIntoView(true);", edit_buttons[0])
                time.sleep(1)

                self.capture(
                    "step19-edit-button-highlighted.png",
                    "Botón de editar",
                    "Cada usuario tiene un botón de editar (ícono de lápiz) que permite modificar su información."
                )

                edit_buttons[0].click()
                time.sleep(2)

                self.capture(
                    "step20-edit-modal-open.png",
                    "Modal de edición abierto",
                    "Se abre el modal de edición con los datos actuales del usuario precargados en los campos."
                )

                # Modificar nombre
                name_input = self.driver.find_element(By.ID, "name")
                name_input.clear()
                name_input.send_keys("María González López - Editada")
                time.sleep(0.5)

                self.capture(
                    "step21-name-modified.png",
                    "Nombre modificado",
                    "Se modifica el nombre del usuario agregando ' - Editada' al final para demostrar la edición."
                )

                # Cambiar rol a Admin
                role_select = self.driver.find_element(By.ID, "role")
                role_select.click()
                time.sleep(0.5)

                admin_option = self.driver.find_element(By.XPATH, "//option[@value='Admin']")
                admin_option.click()
                time.sleep(0.5)

                self.capture(
                    "step22-role-changed-to-admin.png",
                    "Rol cambiado a Admin",
                    "Se cambia el rol del usuario de 'Flebotomista' a 'Admin', otorgándole permisos completos en el sistema."
                )

                # Guardar cambios
                save_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Guardar')]")
                save_btn.click()
                time.sleep(2)

                self.capture(
                    "step23-user-edited-success.png",
                    "Usuario editado exitosamente",
                    "Los cambios se guardan correctamente y se muestra un mensaje de confirmación. La tabla se actualiza con los nuevos datos."
                )

        except Exception as e:
            print(f"⚠️  Error en edición: {str(e)}")

    def change_user_status_flow(self):
        """Flujo de cambio de estado de usuario"""
        print("\n🔄 === PASO 6: CAMBIAR ESTADO DE USUARIO ===\n")

        time.sleep(2)

        try:
            # Buscar menú de opciones del usuario
            menu_buttons = self.driver.find_elements(By.XPATH, "//button[contains(@aria-label, 'Opciones')]")

            if len(menu_buttons) > 0:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", menu_buttons[0])
                time.sleep(1)

                self.capture(
                    "step24-options-menu-button.png",
                    "Botón de menú de opciones",
                    "Cada usuario tiene un botón de menú (tres puntos) que despliega opciones adicionales."
                )

                menu_buttons[0].click()
                time.sleep(1)

                self.capture(
                    "step25-options-menu-open.png",
                    "Menú de opciones desplegado",
                    "El menú muestra opciones como: Cambiar a INACTIVE, Cambiar a BLOCKED, Ver detalles, etc."
                )

                # Click en cambiar a INACTIVE
                inactive_option = self.driver.find_element(By.XPATH, "//button[contains(text(), 'INACTIVE')]")
                inactive_option.click()
                time.sleep(2)

                self.capture(
                    "step26-confirm-inactive-dialog.png",
                    "Diálogo de confirmación",
                    "Se muestra un diálogo de confirmación para asegurar que el usuario desea cambiar el estado."
                )

                # Confirmar
                confirm_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Confirmar')]")
                confirm_btn.click()
                time.sleep(2)

                self.capture(
                    "step27-user-status-changed.png",
                    "Estado cambiado a INACTIVE",
                    "El estado del usuario cambia a INACTIVE. Los usuarios inactivos no pueden iniciar sesión en el sistema."
                )

        except Exception as e:
            print(f"⚠️  Error en cambio de estado: {str(e)}")

    def block_user_flow(self):
        """Flujo de bloqueo de usuario"""
        print("\n🚫 === PASO 7: BLOQUEAR USUARIO ===\n")

        time.sleep(2)

        try:
            # Abrir menú de opciones nuevamente
            menu_buttons = self.driver.find_elements(By.XPATH, "//button[contains(@aria-label, 'Opciones')]")

            if len(menu_buttons) > 0:
                menu_buttons[0].click()
                time.sleep(1)

                self.capture(
                    "step28-menu-for-block.png",
                    "Menú de opciones para bloquear",
                    "Se abre nuevamente el menú para seleccionar la opción de bloqueo permanente."
                )

                # Click en BLOCKED
                blocked_option = self.driver.find_element(By.XPATH, "//button[contains(text(), 'BLOCKED')]")
                blocked_option.click()
                time.sleep(2)

                self.capture(
                    "step29-confirm-block-dialog.png",
                    "Confirmación de bloqueo",
                    "El sistema solicita confirmación para el bloqueo. BLOCKED es un estado permanente y más restrictivo que INACTIVE."
                )

                # Confirmar bloqueo
                confirm_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Confirmar')]")
                confirm_btn.click()
                time.sleep(2)

                self.capture(
                    "step30-user-blocked.png",
                    "Usuario bloqueado exitosamente",
                    "El usuario ahora está en estado BLOCKED (color rojo). No puede iniciar sesión y requiere intervención de un administrador para reactivarse."
                )

        except Exception as e:
            print(f"⚠️  Error en bloqueo: {str(e)}")

    def view_user_details_flow(self):
        """Flujo de visualización de detalles"""
        print("\n👁️  === PASO 8: VER DETALLES DE USUARIO ===\n")

        time.sleep(2)

        try:
            # Click en algún usuario para ver detalles
            user_rows = self.driver.find_elements(By.XPATH, "//tr[contains(@class, 'cursor-pointer')]")

            if len(user_rows) > 0:
                self.driver.execute_script("arguments[0].scrollIntoView(true);", user_rows[0])
                time.sleep(1)

                self.capture(
                    "step31-user-row-clickable.png",
                    "Fila de usuario clickeable",
                    "Cada fila de usuario es clickeable para ver los detalles completos."
                )

                user_rows[0].click()
                time.sleep(2)

                self.capture(
                    "step32-user-details-modal.png",
                    "Modal de detalles de usuario",
                    "Se muestra un modal con todos los detalles del usuario: información personal, rol, permisos, estado, fecha de creación y último acceso."
                )

                # Cerrar modal
                close_btn = self.driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Cerrar')]")
                close_btn.click()
                time.sleep(1)

        except Exception as e:
            print(f"⚠️  Error en detalles: {str(e)}")

    def filter_by_role_flow(self):
        """Flujo de filtrado por rol"""
        print("\n🔽 === PASO 9: FILTRAR POR ROL ===\n")

        time.sleep(2)

        try:
            # Buscar filtro de rol
            role_filter = self.driver.find_element(By.XPATH, "//select[contains(@aria-label, 'Filtrar por rol')]")

            self.capture(
                "step33-role-filter.png",
                "Filtro por rol",
                "El módulo incluye un filtro para ver solo usuarios de un rol específico."
            )

            role_filter.click()
            time.sleep(0.5)

            # Seleccionar Admin
            admin_filter = self.driver.find_element(By.XPATH, "//option[@value='Admin']")
            admin_filter.click()
            time.sleep(1)

            self.capture(
                "step34-filtered-by-admin.png",
                "Usuarios filtrados por Admin",
                "La tabla muestra únicamente los usuarios con rol de Administrador."
            )

            # Resetear filtro
            role_filter.click()
            all_option = self.driver.find_element(By.XPATH, "//option[@value='']")
            all_option.click()
            time.sleep(1)

        except Exception as e:
            print(f"⚠️  No se encontró filtro de rol: {str(e)}")

    def final_overview(self):
        """Vista final del módulo"""
        print("\n📊 === PASO 10: VISTA FINAL COMPLETA ===\n")

        self.driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)

        self.capture(
            "step35-final-users-overview.png",
            "Vista final del módulo de usuarios",
            "Vista completa del módulo de Gestión de Usuarios después de realizar todas las operaciones: crear, editar, cambiar estado, bloquear y filtrar usuarios."
        )

    def save_documentation(self):
        """Guarda la documentación en JSON"""
        doc_file = os.path.join(SCREENSHOT_DIR, "user-management-documentation.json")

        documentation = {
            "module": "Gestión de Usuarios",
            "total_steps": len(self.screenshots),
            "description": "Documentación completa del módulo de Gestión de Usuarios incluyendo todas las operaciones CRUD y cambios de estado",
            "steps": self.screenshots
        }

        with open(doc_file, 'w', encoding='utf-8') as f:
            json.dump(documentation, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Documentación guardada: {doc_file}")

    def run(self):
        """Ejecuta el flujo completo de documentación"""
        try:
            print("="*80)
            print("🚀 DOCUMENTACIÓN COMPLETA DEL MÓDULO DE GESTIÓN DE USUARIOS")
            print("="*80)

            self.login()
            self.navigate_to_users()
            self.create_new_user_flow()
            self.search_user_flow()
            self.edit_user_flow()
            self.change_user_status_flow()
            self.block_user_flow()
            self.view_user_details_flow()
            self.filter_by_role_flow()
            self.final_overview()

            self.save_documentation()

            # Resumen final
            total_size = sum(float(s['size'].replace(' KB', '')) for s in self.screenshots)
            print("\n" + "="*80)
            print("✅ DOCUMENTACIÓN COMPLETADA")
            print("="*80)
            print(f"📊 Total de pasos documentados: {len(self.screenshots)}")
            print(f"💾 Tamaño total: {total_size:.1f} KB ({total_size/1024:.2f} MB)")
            print(f"📁 Directorio: {SCREENSHOT_DIR}")
            print("\n📝 Operaciones documentadas:")
            print("   ✅ Login al sistema")
            print("   ✅ Navegación al módulo")
            print("   ✅ Crear nuevo usuario")
            print("   ✅ Buscar usuarios")
            print("   ✅ Editar usuario existente")
            print("   ✅ Cambiar estado a INACTIVE")
            print("   ✅ Bloquear usuario (BLOCKED)")
            print("   ✅ Ver detalles de usuario")
            print("   ✅ Filtrar por rol")
            print("   ✅ Vista general final")

        finally:
            self.driver.quit()

if __name__ == "__main__":
    documenter = UserManagementDocumentation()
    documenter.run()
    print("\n🎉 ¡Proceso de documentación completado!")
