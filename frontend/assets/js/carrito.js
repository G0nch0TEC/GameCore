// ============================================================
//  carrito.js — GameCore · Carrito de compras
//  Depende de: api.js, auth.js
// ============================================================

import {
  carrito as carritoAPI,
  compras as comprasAPI,
  formatearPrecio,
  mostrarToast,
  actualizarBadgeCarrito,
} from "./api.js";
import { requireAuth, initNavbar } from "./auth.js";

// ─── ESTADO LOCAL ─────────────────────────────────────────────────────────────

let carritoData = null; // última respuesta del backend

// ─── INIT ─────────────────────────────────────────────────────────────────────

/**
 * Punto de entrada.
 * Usar en carrito.html:
 *   <script type="module">
 *     import { initCarrito } from "../assets/js/carrito.js";
 *     initCarrito();
 *   </script>
 */
export async function initCarrito() {
  requireAuth();
  initNavbar();
  await cargarCarrito();
  initBotonConfirmar();
  initBotonVaciar();
}

// ─── CARGA DEL CARRITO ────────────────────────────────────────────────────────

/** Pide el carrito al backend y lo renderiza */
async function cargarCarrito() {
  const contenedor = document.getElementById("contenedor-carrito");
  const skeleton   = document.getElementById("skeleton-carrito");
  if (!contenedor) return;

  mostrarSkeleton(skeleton, true);

  try {
    carritoData = await carritoAPI.ver();
    renderizarCarrito();
    actualizarBadgeCarrito(carritoData.detalles?.length ?? 0);
  } catch (err) {
    contenedor.innerHTML = `
      <div class="carrito-error">
        <p>⚠️ No se pudo cargar el carrito.</p>
        <button onclick="location.reload()">Reintentar</button>
      </div>
    `;
    console.error(err);
  } finally {
    mostrarSkeleton(skeleton, false);
  }
}

// ─── RENDERIZADO ─────────────────────────────────────────────────────────────

/** Renderiza la lista de ítems y el resumen lateral */
function renderizarCarrito() {
  const lista   = document.getElementById("lista-items-carrito");
  const resumen = document.getElementById("resumen-carrito");
  const detalles = carritoData?.detalles ?? [];

  if (!lista) return;

  if (detalles.length === 0) {
    lista.innerHTML = `
      <div class="carrito-vacio">
        <span class="carrito-vacio-icon">🛒</span>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde el catálogo.</p>
        <a href="/frontend/pages/productos.html" class="btn-ir-productos">
          Ver productos
        </a>
      </div>
    `;
    if (resumen) actualizarResumen(0, 0);
    ocultarAcciones(true);
    return;
  }

  lista.innerHTML = detalles.map((item) => crearItemHTML(item)).join("");

  // Eventos por cada ítem
  detalles.forEach((item) => {
    const idDetalle = item.idDetalle;

    // Botón −
    document.getElementById(`btn-menos-${idDetalle}`)
      ?.addEventListener("click", () => cambiarCantidad(idDetalle, item.cantidad - 1));

    // Botón +
    document.getElementById(`btn-mas-${idDetalle}`)
      ?.addEventListener("click", () => cambiarCantidad(idDetalle, item.cantidad + 1));

    // Input directo de cantidad
    document.getElementById(`input-cantidad-${idDetalle}`)
      ?.addEventListener("change", (e) => {
        const val = parseInt(e.target.value) || 1;
        cambiarCantidad(idDetalle, val);
      });

    // Botón eliminar ítem
    document.getElementById(`btn-eliminar-${idDetalle}`)
      ?.addEventListener("click", () => eliminarItem(idDetalle));
  });

  // Totales
  const totalItems    = detalles.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrecio   = detalles.reduce((acc, i) => acc + i.subtotal, 0);
  if (resumen) actualizarResumen(totalItems, totalPrecio);
  ocultarAcciones(false);
}

/** Genera el HTML de un ítem del carrito */
function crearItemHTML(item) {
  const imagenUrl = item.imgUrl || "/frontend/assets/image/Shrek.jpg";
  const subtotal  = item.subtotal ?? item.cantidad * item.precio;

  return `
    <article class="item-carrito" data-detalle="${item.idDetalle}">
      <div class="item-imagen">
        <img src="${imagenUrl}" alt="${item.nombreProducto}"
             onerror="this.src='/frontend/assets/image/Shrek.jpg'" loading="lazy">
      </div>

      <div class="item-info">
        <h4 class="item-nombre">${item.nombreProducto}</h4>
        <p class="item-precio-unit">${formatearPrecio(item.precio)} c/u</p>
      </div>

      <div class="item-cantidad">
        <button class="btn-cantidad" id="btn-menos-${item.idDetalle}"
                ${item.cantidad <= 1 ? "disabled" : ""} aria-label="Reducir cantidad">
          −
        </button>
        <input
          id="input-cantidad-${item.idDetalle}"
          type="number"
          value="${item.cantidad}"
          min="1"
          max="99"
          class="input-cantidad"
          aria-label="Cantidad"
        >
        <button class="btn-cantidad" id="btn-mas-${item.idDetalle}" aria-label="Aumentar cantidad">
          +
        </button>
      </div>

      <div class="item-subtotal">
        <span id="subtotal-${item.idDetalle}">${formatearPrecio(subtotal)}</span>
      </div>

      <button class="btn-eliminar-item" id="btn-eliminar-${item.idDetalle}"
              aria-label="Eliminar ${item.nombreProducto}">
        🗑
      </button>
    </article>
  `;
}

/** Actualiza el panel de resumen lateral */
function actualizarResumen(totalItems, totalPrecio) {
  const elItems  = document.getElementById("resumen-total-items");
  const elPrecio = document.getElementById("resumen-total-precio");
  const elIGV    = document.getElementById("resumen-igv");
  const elFinal  = document.getElementById("resumen-total-final");

  const igv   = totalPrecio * 0.18;
  const final = totalPrecio; // el precio ya incluye IGV en el backend

  if (elItems)  elItems.textContent  = `${totalItems} ${totalItems === 1 ? "ítem" : "ítems"}`;
  if (elPrecio) elPrecio.textContent = formatearPrecio(totalPrecio);
  if (elIGV)    elIGV.textContent    = formatearPrecio(igv);
  if (elFinal)  elFinal.textContent  = formatearPrecio(final);
}

// ─── ACCIONES SOBRE ÍTEMS ─────────────────────────────────────────────────────

/**
 * Actualiza la cantidad de un ítem.
 * Si cantidad < 1 → elimina el ítem automáticamente.
 */
async function cambiarCantidad(idDetalle, nuevaCantidad) {
  if (nuevaCantidad < 1) {
    await eliminarItem(idDetalle);
    return;
  }

  bloquearItem(idDetalle, true);

  try {
    carritoData = await carritoAPI.actualizarCantidad(idDetalle, nuevaCantidad);
    renderizarCarrito();
    actualizarBadgeCarrito(carritoData.detalles?.length ?? 0);
  } catch (err) {
    mostrarToast(err.message || "No se pudo actualizar la cantidad.", "error");
    // Restaurar valor anterior
    const input = document.getElementById(`input-cantidad-${idDetalle}`);
    const itemAnterior = carritoData?.detalles?.find((i) => i.idDetalle === idDetalle);
    if (input && itemAnterior) input.value = itemAnterior.cantidad;
  } finally {
    bloquearItem(idDetalle, false);
  }
}

/** Elimina un ítem del carrito con confirmación visual */
async function eliminarItem(idDetalle) {
  const articulo = document.querySelector(`.item-carrito[data-detalle="${idDetalle}"]`);

  // Animación de salida
  if (articulo) {
    articulo.style.transition = "opacity 0.25s, transform 0.25s";
    articulo.style.opacity    = "0";
    articulo.style.transform  = "translateX(20px)";
    await esperar(250);
  }

  try {
    carritoData = await carritoAPI.eliminarItem(idDetalle);
    renderizarCarrito();
    actualizarBadgeCarrito(carritoData.detalles?.length ?? 0);
    mostrarToast("Producto eliminado del carrito.", "info");
  } catch (err) {
    mostrarToast(err.message || "No se pudo eliminar el producto.", "error");
    if (articulo) {
      articulo.style.opacity   = "1";
      articulo.style.transform = "translateX(0)";
    }
  }
}

// ─── VACIAR CARRITO ───────────────────────────────────────────────────────────

/** Inicializa el botón de vaciar carrito con confirmación */
function initBotonVaciar() {
  const btn = document.getElementById("btn-vaciar-carrito");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const confirmar = await mostrarConfirmacion(
      "¿Vaciar carrito?",
      "Se eliminarán todos los productos. Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    btn.disabled = true;
    try {
      await carritoAPI.vaciar();
      carritoData = { detalles: [] };
      renderizarCarrito();
      actualizarBadgeCarrito(0);
      mostrarToast("Carrito vaciado correctamente.", "info");
    } catch (err) {
      mostrarToast(err.message || "No se pudo vaciar el carrito.", "error");
    } finally {
      btn.disabled = false;
    }
  });
}

// ─── CONFIRMAR COMPRA ─────────────────────────────────────────────────────────

/** Inicializa el botón de confirmar / proceder a compra */
function initBotonConfirmar() {
  const btn = document.getElementById("btn-confirmar-compra");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const detalles = carritoData?.detalles ?? [];
    if (detalles.length === 0) {
      mostrarToast("Tu carrito está vacío.", "info");
      return;
    }

    const total = detalles.reduce((acc, i) => acc + i.subtotal, 0);

    const confirmar = await mostrarConfirmacion(
      "¿Confirmar compra?",
      `Total a pagar: ${formatearPrecio(total)}\nSe registrará la compra con los productos del carrito.`
    );
    if (!confirmar) return;

    btn.disabled = true;
    btn.textContent = "Procesando...";

    try {
      const compra = await comprasAPI.realizar();
      carritoData = { detalles: [] };
      actualizarBadgeCarrito(0);
      mostrarToast("¡Compra realizada con éxito! 🎉", "success");

      // Redirigir al historial de compras tras 1.5s
      setTimeout(() => {
        window.location.href = `/frontend/pages/compras.html`;
      }, 1500);
    } catch (err) {
      mostrarToast(err.message || "No se pudo procesar la compra.", "error");
      btn.disabled = false;
      btn.textContent = "Confirmar compra";
    }
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Bloquea o desbloquea los controles de un ítem mientras se procesa */
function bloquearItem(idDetalle, bloquear) {
  ["btn-menos", "btn-mas", "btn-eliminar", "input-cantidad"].forEach((prefix) => {
    const el = document.getElementById(`${prefix}-${idDetalle}`);
    if (el) el.disabled = bloquear;
  });
}

/** Muestra / oculta los botones de acción globales (vaciar, confirmar) */
function ocultarAcciones(ocultar) {
  const acciones = document.getElementById("acciones-carrito");
  if (acciones) acciones.style.display = ocultar ? "none" : "flex";
}

/** Muestra / oculta el skeleton de carga */
function mostrarSkeleton(el, visible) {
  if (!el) return;
  el.style.display = visible ? "block" : "none";
}

/** Espera N milisegundos */
function esperar(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Muestra un diálogo de confirmación nativo.
 * En el futuro se puede reemplazar por un modal personalizado.
 * @returns {Promise<boolean>}
 */
function mostrarConfirmacion(titulo, mensaje) {
  return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
}
