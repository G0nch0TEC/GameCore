import { mostrarToast, formatearPrecio, actualizarBadgeCarrito } from "../core/utils.js";
import { requireAuth } from "../core/routes.js";
import { initNavbar } from "./auth.page.js";
import { productoService }  from "../services/producto.service.js";
import { categoriaService } from "../services/categoria.service.js";
import { carritoService }   from "../services/carrito.service.js";
import { getProductImage } from "../core/utils.js";
let todosLosProductos = [];
let categoriaActiva   = null;

export async function initProductos() {
  requireAuth();
  initNavbar();
  await cargarCategorias();
  await cargarProductos();
  initBusqueda();
  initOrden();
  sincronizarCarritoBadge();
}

// ─── CARGA DE DATOS ───────────────────────────────────────────────────────────

/** Carga y renderiza las categorías en el menú lateral / filtros */
async function cargarCategorias() {
  const lista = document.getElementById("lista-categorias");
  if (!lista) return;

  try {
    const cats = await categoriaService.listar();

    // Opción "Todas"
    lista.innerHTML = `
      <li>
        <button class="btn-categoria activa" data-id="">
          🎮 Todas
        </button>
      </li>
    `;

    cats.forEach((cat) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <button class="btn-categoria" data-id="${cat.idCategoria}">
          ${cat.nombre}
        </button>
      `;
      lista.appendChild(li);
    });

    // Eventos de clic en categorías
    lista.querySelectorAll(".btn-categoria").forEach((btn) => {
      btn.addEventListener("click", () => {
        lista.querySelectorAll(".btn-categoria").forEach((b) => b.classList.remove("activa"));
        btn.classList.add("activa");
        categoriaActiva = btn.dataset.id ? parseInt(btn.dataset.id) : null;
        filtrarYRenderizar();
      });
    });
  } catch (err) {
    console.error("Error cargando categorías:", err);
  }
}

/** Carga todos los productos del backend y los renderiza */
async function cargarProductos() {
  const grid      = document.getElementById("grid-productos");
  const skeleton  = document.getElementById("skeleton-productos");
  if (!grid) return;

  mostrarSkeleton(skeleton, true);

  try {
    todosLosProductos = await productoService.listarDisponibles();
    filtrarYRenderizar();
  } catch (err) {
    mostrarError(grid, "No se pudieron cargar los productos. Intenta de nuevo.");
    console.error(err);
  } finally {
    mostrarSkeleton(skeleton, false);
  }
}

// ─── FILTRADO Y RENDERIZADO ───────────────────────────────────────────────────

/**
 * Aplica los filtros activos (categoría, búsqueda, orden)
 * y vuelve a pintar el grid.
 */
function filtrarYRenderizar() {
  const searchInput = document.getElementById("input-busqueda");
  const ordenSelect = document.getElementById("select-orden");

  const query  = searchInput?.value.trim().toLowerCase() || "";
  const orden  = ordenSelect?.value || "default";

  let resultado = [...todosLosProductos];

  // Filtro por categoría
  if (categoriaActiva) {
    resultado = resultado.filter((p) => p.idCategoria === categoriaActiva);
  }

  // Filtro por búsqueda local
  if (query) {
    resultado = resultado.filter((p) =>
      p.nombreProducto.toLowerCase().includes(query) ||
      p.descripcion?.toLowerCase().includes(query)
    );
  }

  // Ordenamiento
  if (orden === "precio-asc") {
    resultado.sort((a, b) => a.precio - b.precio);
  } else if (orden === "precio-desc") {
    resultado.sort((a, b) => b.precio - a.precio);
  } else if (orden === "nombre-asc") {
    resultado.sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));
  }

  renderizarProductos(resultado);
  actualizarContador(resultado.length);
}

/** Pinta las tarjetas de productos en el grid */
function renderizarProductos(lista) {
  const grid = document.getElementById("grid-productos");
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="sin-resultados">
        <p>😕 No se encontraron productos.</p>
        <button onclick="location.reload()">Recargar</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = lista.map((p) => crearTarjetaProducto(p)).join("");

  // Eventos de agregar al carrito
  grid.querySelectorAll(".btn-agregar-carrito").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idProducto = parseInt(btn.dataset.id);
      agregarAlCarrito(idProducto, btn);
    });
  });

  // Eventos de ver detalle (click en la tarjeta excepto el botón)
  grid.querySelectorAll(".tarjeta-producto").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-agregar-carrito")) return;
      const id = card.dataset.id;
      abrirModalDetalle(parseInt(id));
    });
  });
}

/** Genera el HTML de una tarjeta de producto */
function crearTarjetaProducto(p) {
  const imagenUrl = getProductImage(p.imgUrl);
  const agotado   = p.stock === 0;

  return `
    <article class="tarjeta-producto ${agotado ? "agotado" : ""}" data-id="${p.idProducto}" role="button" tabindex="0">
      <div class="tarjeta-imagen">
        <img src="${imagenUrl}" alt="${p.nombreProducto}" loading="lazy"
             onerror="this.src='/frontend/assets/image/Shrek.jpg'">
        ${agotado ? '<span class="badge-agotado">Agotado</span>' : ""}
        ${p.stock <= 5 && p.stock > 0 ? `<span class="badge-stock">¡Solo ${p.stock}!</span>` : ""}
      </div>
      <div class="tarjeta-info">
        <h3 class="tarjeta-nombre">${p.nombreProducto}</h3>
        <p class="tarjeta-descripcion">${p.descripcion || ""}</p>
        <div class="tarjeta-footer">
          <span class="tarjeta-precio">${formatearPrecio(p.precio)}</span>
          <button
            class="btn-agregar-carrito"
            data-id="${p.idProducto}"
            ${agotado ? "disabled" : ""}
            title="${agotado ? "Sin stock" : "Agregar al carrito"}"
          >
            ${agotado ? "Sin stock" : "🛒 Agregar"}
          </button>
        </div>
      </div>
    </article>
  `;
}

// ─── BUSCADOR ─────────────────────────────────────────────────────────────────

/** Inicializa el input de búsqueda con debounce */
function initBusqueda() {
  const input = document.getElementById("input-busqueda");
  if (!input) return;

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(filtrarYRenderizar, 300);
  });

  // Botón limpiar búsqueda
  const btnLimpiar = document.getElementById("btn-limpiar-busqueda");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      input.value = "";
      filtrarYRenderizar();
      input.focus();
    });
  }
}

// ─── ORDENAMIENTO ─────────────────────────────────────────────────────────────

/** Inicializa el select de ordenamiento */
function initOrden() {
  const select = document.getElementById("select-orden");
  if (!select) return;
  select.addEventListener("change", filtrarYRenderizar);
}

// ─── AGREGAR AL CARRITO ───────────────────────────────────────────────────────

/**
 * Agrega un producto al carrito del usuario.
 * @param {number} idProducto
 * @param {HTMLElement} btn   - Botón que disparó la acción
 */
async function agregarAlCarrito(idProducto, btn) {
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Agregando...";

  try {
    const carritoActualizado = await carritoService.agregar(idProducto, 1);
    const totalItems = carritoActualizado.detalles?.length ?? 0;
    actualizarBadgeCarrito(totalItems);
    mostrarToast("¡Producto agregado al carrito! 🎮", "success");
    btn.textContent = "✓ Agregado";
    setTimeout(() => {
      btn.textContent = textoOriginal;
      btn.disabled = false;
    }, 1500);
  } catch (err) {
    mostrarToast(err.message || "No se pudo agregar al carrito.", "error");
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
}

// ─── MODAL DE DETALLE ─────────────────────────────────────────────────────────

/**
 * Abre un modal con el detalle completo del producto.
 * @param {number} idProducto
 */
async function abrirModalDetalle(idProducto) {
  let modal = document.getElementById("modal-producto");
  if (!modal) {
    modal = crearModal();
    document.body.appendChild(modal);
  }

  const content = modal.querySelector(".modal-content-inner");
  content.innerHTML = `<p class="modal-loading">Cargando...</p>`;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  try {
    const p = await productoService.buscarPorId(idProducto);
    const imagenUrl = getProductImage(p.imgUrl);
    const agotado   = p.stock === 0;

    content.innerHTML = `
      <button class="modal-cerrar" id="btn-cerrar-modal" aria-label="Cerrar">✕</button>
      <div class="modal-grid">
        <div class="modal-imagen">
          <img src="${imagenUrl}" alt="${p.nombreProducto}"
               onerror="this.src='/frontend/assets/image/Shrek.jpg'">
        </div>
        <div class="modal-detalle">
          <span class="modal-categoria">${p.nombreCategoria || "Categoría"}</span>
          <h2>${p.nombreProducto}</h2>
          <p class="modal-descripcion">${p.descripcion || "Sin descripción."}</p>
          <div class="modal-precio">${formatearPrecio(p.precio)}</div>
          <p class="modal-stock">
            ${agotado
              ? "❌ Sin stock disponible"
              : `✅ Stock disponible: <strong>${p.stock}</strong> unidades`}
          </p>

          <div class="modal-cantidad" ${agotado ? 'style="display:none"' : ""}>
            <label for="modal-input-cantidad">Cantidad:</label>
            <div class="cantidad-control">
              <button id="btn-cantidad-menos">−</button>
              <input id="modal-input-cantidad" type="number" value="1" min="1" max="${p.stock}">
              <button id="btn-cantidad-mas">+</button>
            </div>
          </div>

          <button
            id="btn-modal-agregar"
            class="btn-agregar-carrito-modal"
            data-id="${p.idProducto}"
            ${agotado ? "disabled" : ""}
          >
            ${agotado ? "Sin stock" : "🛒 Agregar al carrito"}
          </button>
        </div>
      </div>
    `;

    // Eventos del modal
    document.getElementById("btn-cerrar-modal").addEventListener("click", cerrarModal);

    if (!agotado) {
      initControlCantidad(p.stock);
      document.getElementById("btn-modal-agregar").addEventListener("click", async (e) => {
        const cantidad = parseInt(document.getElementById("modal-input-cantidad").value) || 1;
        await agregarAlCarrito(p.idProducto, e.currentTarget);
        // Si quisieras agregar con cantidad > 1 podrías usar:
        // await carrito.agregar(p.idProducto, cantidad);
      });
    }
  } catch (err) {
    content.innerHTML = `<p class="modal-error">Error al cargar el producto.</p>`;
    console.error(err);
  }
}

/** Crea el elemento del modal en el DOM */
function crearModal() {
  const modal = document.createElement("div");
  modal.id = "modal-producto";
  modal.className = "modal-overlay";
  modal.innerHTML = `<div class="modal-box"><div class="modal-content-inner"></div></div>`;

  // Cerrar al hacer clic fuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });

  return modal;
}

/** Cierra el modal de detalle */
function cerrarModal() {
  const modal = document.getElementById("modal-producto");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

/** Inicializa los controles +/− de cantidad en el modal */
function initControlCantidad(stockMax) {
  const input   = document.getElementById("modal-input-cantidad");
  const btnMas  = document.getElementById("btn-cantidad-mas");
  const btnMenos = document.getElementById("btn-cantidad-menos");
  if (!input || !btnMas || !btnMenos) return;

  btnMas.addEventListener("click", () => {
    const val = parseInt(input.value) || 1;
    if (val < stockMax) input.value = val + 1;
  });

  btnMenos.addEventListener("click", () => {
    const val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });

  input.addEventListener("change", () => {
    let val = parseInt(input.value) || 1;
    if (val < 1)        val = 1;
    if (val > stockMax) val = stockMax;
    input.value = val;
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Muestra/oculta el skeleton de carga */
function mostrarSkeleton(el, visible) {
  if (!el) return;
  el.style.display = visible ? "grid" : "none";
}

/** Muestra un mensaje de error en el contenedor dado */
function mostrarError(container, msg) {
  if (!container) return;
  container.innerHTML = `
    <div class="error-carga">
      <p>⚠️ ${msg}</p>
      <button onclick="location.reload()">Reintentar</button>
    </div>
  `;
}

/** Actualiza el texto del contador de resultados */
function actualizarContador(total) {
  const el = document.getElementById("contador-resultados");
  if (!el) return;
  el.textContent = total === 1 ? "1 producto encontrado" : `${total} productos encontrados`;
}

/** Sincroniza el badge del carrito al cargar la página */
async function sincronizarCarritoBadge() {
  try {
    const carritoData = await carritoService.ver();
    const total = carritoData?.detalles?.length ?? 0;
    actualizarBadgeCarrito(total);
  } catch {
    // silencioso — el usuario puede no tener carrito aún
  }
}