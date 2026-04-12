// ============================================================
//  compras.js — GameCore · Historial de compras del cliente
//  Depende de: api.js, auth.js
// ============================================================

import {
  compras as comprasAPI,
  formatearPrecio,
  formatearFecha,
  mostrarToast,
} from "./api.js";
import { requireAuth, initNavbar } from "./auth.js";

// ─── INIT ─────────────────────────────────────────────────────────────────────

/**
 * Punto de entrada.
 * Usar en compras.html:
 *   <script type="module">
 *     import { initCompras } from "../assets/js/compras.js";
 *     initCompras();
 *   </script>
 */
export async function initCompras() {
  requireAuth();
  initNavbar();
  await cargarHistorial();
  initFiltroEstado();
}

// ─── CARGA DEL HISTORIAL ──────────────────────────────────────────────────────

/** Pide el historial al backend y lo renderiza */
async function cargarHistorial() {
  const lista    = document.getElementById("lista-compras");
  const skeleton = document.getElementById("skeleton-compras");
  if (!lista) return;

  mostrarSkeleton(skeleton, true);

  try {
    const compras = await comprasAPI.misCompras();
    renderizarHistorial(compras);
    guardarEnCache(compras);
  } catch (err) {
    lista.innerHTML = `
      <div class="compras-error">
        <p>⚠️ No se pudo cargar el historial de compras.</p>
        <button onclick="location.reload()">Reintentar</button>
      </div>
    `;
    console.error(err);
  } finally {
    mostrarSkeleton(skeleton, false);
  }
}

// ─── RENDERIZADO DEL HISTORIAL ────────────────────────────────────────────────

/**
 * Pinta todas las compras en la lista.
 * @param {Array} compras
 */
function renderizarHistorial(compras) {
  const lista = document.getElementById("lista-compras");
  const contador = document.getElementById("contador-compras");
  if (!lista) return;

  if (compras.length === 0) {
    lista.innerHTML = `
      <div class="compras-vacio">
        <span class="compras-vacio-icon">🧾</span>
        <h3>Aún no tienes compras</h3>
        <p>Cuando realices una compra aparecerá aquí tu historial.</p>
        <a href="/frontend/pages/productos.html" class="btn-ir-productos">
          Explorar productos
        </a>
      </div>
    `;
    if (contador) contador.textContent = "0 compras";
    return;
  }

  // Ordenar de más reciente a más antigua
  const ordenadas = [...compras].sort(
    (a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)
  );

  lista.innerHTML = ordenadas.map((c) => crearTarjetaCompra(c)).join("");

  if (contador) {
    contador.textContent = `${compras.length} ${compras.length === 1 ? "compra" : "compras"}`;
  }

  // Eventos: expandir detalle y cancelar
  ordenadas.forEach((c) => {
    document.getElementById(`btn-detalle-${c.idCompra}`)
      ?.addEventListener("click", () => toggleDetalle(c.idCompra));

    document.getElementById(`btn-cancelar-${c.idCompra}`)
      ?.addEventListener("click", () => cancelarCompra(c.idCompra));
  });
}

/** Genera el HTML de una tarjeta de compra colapsable */
function crearTarjetaCompra(c) {
  const estado     = c.estado?.toLowerCase() ?? "pendiente";
  const esCancelable = estado === "pendiente";

  return `
    <article class="tarjeta-compra estado-${estado}" id="compra-${c.idCompra}">

      <!-- Encabezado -->
      <div class="compra-header">
        <div class="compra-meta">
          <span class="compra-id">#${c.idCompra}</span>
          <span class="compra-fecha">${formatearFecha(c.fechaCompra)}</span>
        </div>
        <div class="compra-resumen">
          <span class="badge-estado badge-${estado}">${labelEstado(estado)}</span>
          <strong class="compra-total">${formatearPrecio(c.total)}</strong>
        </div>
      </div>

      <!-- Preview de productos (máx 3 imágenes) -->
      <div class="compra-preview">
        ${previsualizarProductos(c.detalles)}
        <span class="compra-num-items">
          ${c.detalles?.length ?? 0} ${(c.detalles?.length ?? 0) === 1 ? "producto" : "productos"}
        </span>
      </div>

      <!-- Acciones -->
      <div class="compra-acciones">
        <button class="btn-ver-detalle" id="btn-detalle-${c.idCompra}">
          Ver detalle ▾
        </button>
        ${esCancelable
          ? `<button class="btn-cancelar-compra" id="btn-cancelar-${c.idCompra}">
               Cancelar compra
             </button>`
          : ""}
      </div>

      <!-- Detalle expandible -->
      <div class="compra-detalle-panel" id="panel-${c.idCompra}" style="display:none">
        ${renderizarDetalleProductos(c.detalles)}
      </div>

    </article>
  `;
}

/** Muestra las primeras 3 imágenes de los productos de la compra */
function previsualizarProductos(detalles = []) {
  const primeras = detalles.slice(0, 3);
  const resto    = detalles.length - primeras.length;

  const imgs = primeras.map((d) => `
    <img
      src="${d.imgUrl || "/frontend/assets/image/Shrek.jpg"}"
      alt="${d.nombreProducto}"
      class="preview-img"
      title="${d.nombreProducto}"
      onerror="this.src='/frontend/assets/image/Shrek.jpg'"
    >
  `).join("");

  const mas = resto > 0
    ? `<span class="preview-mas">+${resto}</span>`
    : "";

  return `<div class="preview-imgs">${imgs}${mas}</div>`;
}

/** Renderiza la tabla de productos dentro del panel de detalle */
function renderizarDetalleProductos(detalles = []) {
  if (!detalles || detalles.length === 0) {
    return `<p class="sin-detalle">Sin detalle disponible.</p>`;
  }

  const filas = detalles.map((d) => `
    <tr>
      <td class="detalle-img-cell">
        <img
          src="${d.imgUrl || "/frontend/assets/image/Shrek.jpg"}"
          alt="${d.nombreProducto}"
          class="detalle-thumb"
          onerror="this.src='/frontend/assets/image/Shrek.jpg'"
        >
      </td>
      <td class="detalle-nombre">${d.nombreProducto}</td>
      <td class="detalle-cantidad">× ${d.cantidad}</td>
      <td class="detalle-precio-unit">${formatearPrecio(d.precioUnitario)}</td>
      <td class="detalle-subtotal">${formatearPrecio(d.cantidad * d.precioUnitario)}</td>
    </tr>
  `).join("");

  const totalDetalle = detalles.reduce(
    (acc, d) => acc + d.cantidad * d.precioUnitario, 0
  );

  return `
    <table class="tabla-detalle-compra">
      <thead>
        <tr>
          <th></th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
      <tfoot>
        <tr>
          <td colspan="4" class="total-label">Total</td>
          <td class="total-valor">${formatearPrecio(totalDetalle)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ─── EXPANDIR / COLAPSAR DETALLE ──────────────────────────────────────────────

/** Alterna la visibilidad del panel de detalle de una compra */
function toggleDetalle(idCompra) {
  const panel = document.getElementById(`panel-${idCompra}`);
  const btn   = document.getElementById(`btn-detalle-${idCompra}`);
  if (!panel || !btn) return;

  const visible = panel.style.display !== "none";
  panel.style.display = visible ? "none" : "block";
  btn.textContent     = visible ? "Ver detalle ▾" : "Ocultar detalle ▴";
}

// ─── CANCELAR COMPRA ──────────────────────────────────────────────────────────

/** Cancela una compra pendiente */
async function cancelarCompra(idCompra) {
  const confirmar = window.confirm(
    `¿Cancelar la compra #${idCompra}?\n\nEsta acción no se puede deshacer.`
  );
  if (!confirmar) return;

  const btn = document.getElementById(`btn-cancelar-${idCompra}`);
  if (btn) {
    btn.disabled     = true;
    btn.textContent  = "Cancelando...";
  }

  try {
    await comprasAPI.cancelar(idCompra);
    mostrarToast(`Compra #${idCompra} cancelada correctamente.`, "info");

    // Actualizar solo el badge de estado en la tarjeta sin recargar todo
    const tarjeta = document.getElementById(`compra-${idCompra}`);
    if (tarjeta) {
      tarjeta.classList.remove("estado-pendiente");
      tarjeta.classList.add("estado-cancelado");

      const badge = tarjeta.querySelector(".badge-estado");
      if (badge) {
        badge.className   = "badge-estado badge-cancelado";
        badge.textContent = labelEstado("cancelado");
      }

      if (btn) btn.remove(); // quitar el botón de cancelar
    }
  } catch (err) {
    mostrarToast(err.message || "No se pudo cancelar la compra.", "error");
    if (btn) {
      btn.disabled    = false;
      btn.textContent = "Cancelar compra";
    }
  }
}

// ─── FILTRO POR ESTADO ────────────────────────────────────────────────────────

/** Inicializa los botones de filtro por estado */
function initFiltroEstado() {
  const filtros = document.querySelectorAll(".btn-filtro-estado");
  if (!filtros.length) return;

  filtros.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtros.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      const estado = btn.dataset.estado; // "todos" | "pendiente" | "pagado" | "cancelado"
      filtrarPorEstado(estado);
    });
  });
}

/** Muestra u oculta las tarjetas según el estado seleccionado */
function filtrarPorEstado(estado) {
  const tarjetas = document.querySelectorAll(".tarjeta-compra");

  tarjetas.forEach((t) => {
    if (estado === "todos") {
      t.style.display = "block";
    } else {
      const coincide = t.classList.contains(`estado-${estado}`);
      t.style.display = coincide ? "block" : "none";
    }
  });

  // Actualizar contador
  const visibles  = [...tarjetas].filter((t) => t.style.display !== "none").length;
  const contador  = document.getElementById("contador-compras");
  if (contador) {
    contador.textContent = `${visibles} ${visibles === 1 ? "compra" : "compras"}`;
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Etiqueta legible para cada estado */
function labelEstado(estado) {
  const labels = {
    pendiente: "⏳ Pendiente",
    pagado:    "✅ Pagado",
    cancelado: "❌ Cancelado",
  };
  return labels[estado] ?? estado;
}

/** Guarda las compras en sessionStorage para acceso rápido */
function guardarEnCache(compras) {
  try {
    sessionStorage.setItem("gc_compras", JSON.stringify(compras));
  } catch { /* ignorar si el storage falla */ }
}

/** Muestra / oculta el skeleton de carga */
function mostrarSkeleton(el, visible) {
  if (!el) return;
  el.style.display = visible ? "block" : "none";
}
