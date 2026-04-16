import { compraService }   from "../services/compras.service.js";
import { formatearPrecio, formatearFecha, mostrarToast } from "../core/utils.js";
import { requireAdmin }    from "../core/routes.js";
import { initNavbar }      from "../pages/auth.page.js";
import { buscarEnTabla, filtrarTabla, initBusquedaAdmin } from "./admin.utils.js";
/**
 * Punto de entrada para pages/admin/compras.html
 */
export async function initAdminCompras() {
  await requireAdmin();
  await initNavbar();
  await cargarTablaCompras();
  
  initFiltroEstadoAdmin();
  initBusquedaAdmin("input-busqueda-compra", "tabla-compras-body", buscarEnTabla);
}

async function cargarTablaCompras() {
  const tbody = document.getElementById("tabla-compras-body");
  if (!tbody) return;

  try {
    const lista = await compraService.listarTodas();
    const ordenadas = [...lista].sort(
      (a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)
    );

    tbody.innerHTML = ordenadas.map((c) => `
      <tr id="fila-compra-${c.idCompra}" class="fila-estado-${c.estado?.toLowerCase()}">
        <td>#${c.idCompra}</td>
        <td>${c.idUsuario ?? "—"}</td>
        <td>${formatearFecha(c.fechaCompra)}</td>
        <td>
          <select class="select-estado-compra"
                  data-id="${c.idCompra}"
                  data-actual="${c.estado?.toLowerCase()}">
            <option value="PENDIENTE" ${c.estado?.toLowerCase() === "pendiente" ? "selected" : ""}>⏳ Pendiente</option>
            <option value="PAGADO"    ${c.estado?.toLowerCase() === "pagado"    ? "selected" : ""}>✅ Pagado</option>
            <option value="CANCELADO" ${c.estado?.toLowerCase() === "cancelado" ? "selected" : ""}>❌ Cancelado</option>
          </select>
        </td>
        <td>${formatearPrecio(c.total)}</td>
        <td>
          <button class="btn-tabla btn-ver-detalle-admin" data-id="${c.idCompra}" title="Ver detalle">
            🔍
          </button>
        </td>
      </tr>
      <tr class="fila-detalle-admin" id="detalle-admin-${c.idCompra}" style="display:none">
        <td colspan="6">
          <div class="detalle-compra-admin" id="contenido-detalle-${c.idCompra}">
            <span class="cargando-detalle">Cargando...</span>
          </div>
        </td>
      </tr>
    `).join("");

    // Evento: cambiar estado desde el select
    tbody.querySelectorAll(".select-estado-compra").forEach((sel) => {
      sel.addEventListener("change", () =>
        cambiarEstadoCompra(parseInt(sel.dataset.id), sel.value, sel)
      );
    });

    // Evento: ver detalle
    tbody.querySelectorAll(".btn-ver-detalle-admin").forEach((btn) => {
      btn.addEventListener("click", () =>
        toggleDetalleAdmin(parseInt(btn.dataset.id))
      );
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="error-tabla">Error al cargar compras.</td></tr>`;
    console.error(err);
  }
}

async function cambiarEstadoCompra(id, nuevoEstado, selectEl) {
  const estadoAnterior = selectEl.dataset.actual;
  if (!window.confirm(`¿Cambiar estado de la compra #${id} a ${nuevoEstado}?`)) {
    // Revertir visualmente
    selectEl.value = estadoAnterior.toUpperCase();
    return;
  }

  selectEl.disabled = true;
  try {
    await compraService.cambiarEstado(id, nuevoEstado);
    mostrarToast(`Estado de compra #${id} actualizado a ${nuevoEstado}.`, "success");
    selectEl.dataset.actual = nuevoEstado.toLowerCase();

    // Actualizar clase de la fila
    const fila = document.getElementById(`fila-compra-${id}`);
    if (fila) {
      fila.className = `fila-estado-${nuevoEstado.toLowerCase()}`;
    }
  } catch (err) {
    mostrarToast(err.message || "No se pudo cambiar el estado.", "error");
    selectEl.value = estadoAnterior.toUpperCase();
  } finally {
    selectEl.disabled = false;
  }
}

async function toggleDetalleAdmin(idCompra) {
  const filaDetalle = document.getElementById(`detalle-admin-${idCompra}`);
  const contenido   = document.getElementById(`contenido-detalle-${idCompra}`);
  const btn         = document.querySelector(`.btn-ver-detalle-admin[data-id="${idCompra}"]`);
  if (!filaDetalle) return;

  const visible = filaDetalle.style.display !== "none";

  if (visible) {
    filaDetalle.style.display = "none";
    if (btn) btn.textContent = "🔍";
    return;
  }

  filaDetalle.style.display = "table-row";
  if (btn) btn.textContent = "▴";

  // Cargar detalle si aún no fue cargado
  if (contenido?.dataset.loaded === "true") return;

  try {
    const compra = await compraService.verDetalleAdmin(idCompra); // llama como admin
    contenido.innerHTML = renderizarDetalleAdminHTML(compra);
    contenido.dataset.loaded = "true";
  } catch (err) {
    contenido.innerHTML = `<p class="error-tabla">Error al cargar detalle.</p>`;
  }
}

function renderizarDetalleAdminHTML(compra) {
  const detalles = compra.detalles ?? [];
  const filas = detalles.map((d) => `
    <tr>
      <td>${d.nombreProducto}</td>
      <td>× ${d.cantidad}</td>
      <td>${formatearPrecio(d.precioUnitario)}</td>
      <td>${formatearPrecio(d.cantidad * d.precioUnitario)}</td>
    </tr>
  `).join("");

  return `
    <table class="tabla-detalle-compra tabla-admin-detalle">
      <thead>
        <tr><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr>
      </thead>
      <tbody>${filas}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="total-label">Total</td>
          <td class="total-valor">${formatearPrecio(compra.total)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function initFiltroEstadoAdmin() {
  document.querySelectorAll(".btn-filtro-estado-admin").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-filtro-estado-admin").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      const estado = btn.dataset.estado;

      filtrarTabla("tabla-compras-body", (fila) => {
        if (!fila.classList.contains("fila-estado-pendiente") &&
            !fila.classList.contains("fila-estado-pagado") &&
            !fila.classList.contains("fila-estado-cancelado")) {
          // es una fila de detalle expandible → sigue la visibilidad de su padre
          return null; // se maneja por separado
        }
        if (estado === "todos") return true;
        return fila.classList.contains(`fila-estado-${estado}`);
      });
    });
  });
}