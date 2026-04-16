import { usuarioService }  from "../services/usuario.service.js";
import { formatearFecha, mostrarToast } from "../core/utils.js";
import { requireAdmin }    from "../core/routes.js";
import { initNavbar }      from "../pages/auth.page.js";
import { user } from "../core/storage.js";
import { buscarEnTabla, filtrarTabla, initBusquedaAdmin } from "./admin.utils.js";
/**
 * Punto de entrada para pages/admin/usuarios.html
 */
export async function initAdminUsuarios() {
  await requireAdmin();
  await initNavbar();
  await cargarTablaUsuarios();
  initBusquedaAdmin("input-busqueda-usuario", "tabla-usuarios-body", buscarEnTabla);
  initFiltroRol();
}

async function cargarTablaUsuarios() {
  const tbody = document.getElementById("tabla-usuarios-body");
  if (!tbody) return;

  try {
    const lista = await usuarioService.listarTodos();
    tbody.innerHTML = lista.map((u) => `
      <tr id="fila-usuario-${u.idUsuario}">
        <td>${u.idUsuario}</td>
        <td>${u.nombre}</td>
        <td>${u.correo}</td>
        <td>
          <span class="badge-rol badge-${u.rol?.toLowerCase()}">${u.rol}</span>
        </td>
        <td>${formatearFecha(u.fechaRegistro)}</td>
        <td class="acciones-celda">
          <button class="btn-tabla btn-cambiar-rol"
                  data-id="${u.idUsuario}"
                  data-rol="${u.rol}"
                  title="Cambiar rol">
            ${u.rol?.toLowerCase() === "admin" ? "→ Cliente" : "→ Admin"}
          </button>
          <button class="btn-tabla btn-eliminar"
                  data-id="${u.idUsuario}"
                  data-nombre="${u.nombre}"
                  title="Eliminar">🗑</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-cambiar-rol").forEach((btn) => {
      btn.addEventListener("click", () =>
        cambiarRolUsuario(parseInt(btn.dataset.id), btn.dataset.rol, btn)
      );
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () =>
        confirmarEliminarUsuario(parseInt(btn.dataset.id), btn.dataset.nombre)
      );
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="error-tabla">Error al cargar usuarios.</td></tr>`;
    console.error(err);
  }
}

async function cambiarRolUsuario(id, rolActual, btn) {
  const nuevoRol = rolActual?.toLowerCase() === "admin" ? "CLIENTE" : "ADMIN";
  if (!window.confirm(`¿Cambiar rol del usuario #${id} a ${nuevoRol}?`)) return;

  btn.disabled = true;
  try {
    await usuarioService.cambiarRol(id, nuevoRol);
    mostrarToast(`Rol actualizado a ${nuevoRol}.`, "success");
    const yo = user.get();
    if (yo && id === yo.id) {                        // ← ajusta el campo según lo que guarda authService
      user.set({ ...yo, rol: nuevoRol.toLowerCase() });
    }


    await cargarTablaUsuarios(); // refrescar tabla
  } catch (err) {
    mostrarToast(err.message || "No se pudo cambiar el rol.", "error");
    btn.disabled = false;
  }
}

async function confirmarEliminarUsuario(id, nombre) {
  if (!window.confirm(`¿Eliminar al usuario "${nombre}" (#${id})?\nEsta acción no se puede deshacer.`)) return;
  try {
    await usuarioService.eliminar(id);
    mostrarToast("Usuario eliminado.", "info");
    document.getElementById(`fila-usuario-${id}`)?.remove();
  } catch (err) {
    mostrarToast(err.message || "No se pudo eliminar el usuario.", "error");
  }
}

function initFiltroRol() {
  document.querySelectorAll(".btn-filtro-rol").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-filtro-rol").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      const rol = btn.dataset.rol; // "todos" | "admin" | "cliente"
      filtrarTabla("tabla-usuarios-body", (fila) => {
        if (rol === "todos") return true;
        return fila.querySelector(".badge-rol")?.textContent?.toLowerCase() === rol;
      });
    });
  });
}