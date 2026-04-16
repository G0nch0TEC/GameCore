import {categoriaService} from "../services/categoria.service.js";
import { formatearFecha, mostrarToast } from "../core/utils.js";
import { requireAdmin }    from "../core/routes.js";
import { initNavbar }      from "../pages/auth.page.js";
import { buscarEnTabla, setLoading, getField, setField, initBusquedaAdmin } from "./admin.utils.js";
/**
 * Punto de entrada para pages/admin/categorias.htmls
 */
export async function initAdminCategorias() {
  await requireAdmin();
  await initNavbar();
  await cargarTablaCategorias();
  
  initModalCategoria();
  initBusquedaAdmin("input-busqueda-categoria", "tabla-categorias-body", buscarEnTabla);
}

async function cargarTablaCategorias() {
  const tbody = document.getElementById("tabla-categorias-body");
  if (!tbody) return;

  try {
    const lista = await categoriaService.listar();
    tbody.innerHTML = lista.map((c) => `
      <tr id="fila-categoria-${c.idCategoria}">
        <td>${c.idCategoria}</td>
        <td>${c.nombre}</td>
        <td>${c.descripcion || "—"}</td>
        <td>${formatearFecha(c.fechaCreacion)}</td>
        <td class="acciones-celda">
          <button class="btn-tabla btn-editar" data-id="${c.idCategoria}"
                  data-nombre="${c.nombre}" data-desc="${c.descripcion || ""}" title="Editar">✏️</button>
          <button class="btn-tabla btn-eliminar" data-id="${c.idCategoria}" title="Eliminar">🗑</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () =>
        abrirModalCategoria(parseInt(btn.dataset.id), btn.dataset.nombre, btn.dataset.desc)
      );
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => confirmarEliminarCategoria(parseInt(btn.dataset.id)));
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="error-tabla">Error al cargar categorías.</td></tr>`;
    console.error(err);
  }
}

function initModalCategoria() {
  document.getElementById("btn-nueva-categoria")
    ?.addEventListener("click", () => abrirModalCategoria(null, "", ""));

  const modal = document.getElementById("modal-categoria-admin");
  modal?.querySelector(".btn-cerrar-modal")
       ?.addEventListener("click", cerrarModalCategoria);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModalCategoria();
  });

  document.getElementById("form-categoria")
    ?.addEventListener("submit", guardarCategoria);
}

function abrirModalCategoria(id, nombre, descripcion) {
  const modal  = document.getElementById("modal-categoria-admin");
  const titulo = document.getElementById("modal-categoria-titulo");
  const form   = document.getElementById("form-categoria");
  if (!modal || !form) return;

  form.reset();
  titulo.textContent = id ? "Editar categoría" : "Nueva categoría";
  form.dataset.id    = id ?? "";
  setField(form, "nombre_categoria",      nombre);
  setField(form, "descripcion_categoria", descripcion);

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarModalCategoria() {
  const modal = document.getElementById("modal-categoria-admin");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

async function guardarCategoria(e) {
  e.preventDefault();
  const form    = e.target;
  const btnSave = form.querySelector("button[type='submit']");
  const id      = form.dataset.id ? parseInt(form.dataset.id) : null;
  const nombre  = getField(form, "nombre_categoria");
  const desc    = getField(form, "descripcion_categoria");

  if (!nombre) {
    mostrarToast("El nombre es obligatorio.", "error");
    return;
  }

  setLoading(btnSave, true, "Guardando...");
  try {
    if (id) {
      await categoriaService.actualizar(id, nombre, desc);
      mostrarToast("Categoría actualizada.", "success");
    } else {
      await categoriaService.crear(nombre, desc);
      mostrarToast("Categoría creada.", "success");
    }
    cerrarModalCategoria();
    await cargarTablaCategorias();
  } catch (err) {
    mostrarToast(err.message || "No se pudo guardar la categoría.", "error");
  } finally {
    setLoading(btnSave, false, "Guardar");
  }
}

async function confirmarEliminarCategoria(id) {
  if (!window.confirm(`¿Eliminar categoría #${id}?`)) return;
  try {
    await categoriaService.eliminar(id);
    mostrarToast("Categoría eliminada.", "info");
    document.getElementById(`fila-categoria-${id}`)?.remove();
  } catch (err) {
    mostrarToast(err.message || "No se pudo eliminar. Puede tener productos asociados.", "error");
  }
}