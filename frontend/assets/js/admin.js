// ============================================================
//  admin.js — GameCore · Panel de administración
//  Depende de: api.js, auth.js
//  Cubre: Dashboard, Productos, Categorías, Usuarios, Compras
// ============================================================

import {
  productos as productosAPI,
  categorias as categoriasAPI,
  usuarios as usuariosAPI,
  compras as comprasAPI,
  formatearPrecio,
  formatearFecha,
  mostrarToast,
} from "./api.js";
import { requireAdmin, initNavbar } from "./auth.js";

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════

/**
 * Punto de entrada para dashboard.html
 * Muestra métricas generales del negocio.
 */
export async function initDashboard() {
  requireAdmin();
  initNavbar();

  await Promise.allSettled([
    cargarMetricaProductos(),
    cargarMetricaUsuarios(),
    cargarMetricaCompras(),
    cargarComprasRecientes(),
  ]);
}

async function cargarMetricaProductos() {
  try {
    const lista = await productosAPI.listar();
    setMetrica("metrica-total-productos", lista.length);
    setMetrica("metrica-productos-activos",
      lista.filter((p) => p.estado === "activo").length);
    setMetrica("metrica-productos-agotados",
      lista.filter((p) => p.stock === 0).length);
  } catch (e) { console.error(e); }
}

async function cargarMetricaUsuarios() {
  try {
    const lista = await usuariosAPI.listarTodos();
    setMetrica("metrica-total-usuarios", lista.length);
    setMetrica("metrica-clientes",
      lista.filter((u) => u.rol === "cliente").length);
  } catch (e) { console.error(e); }
}

async function cargarMetricaCompras() {
  try {
    const lista = await comprasAPI.listarTodas();
    const totalVentas = lista
      .filter((c) => c.estado === "pagado")
      .reduce((acc, c) => acc + c.total, 0);
    setMetrica("metrica-total-compras", lista.length);
    setMetrica("metrica-ventas-totales", formatearPrecio(totalVentas), false);
    setMetrica("metrica-pendientes",
      lista.filter((c) => c.estado?.toLowerCase() === "pendiente").length);
  } catch (e) { console.error(e); }
}

async function cargarComprasRecientes() {
  const tabla = document.getElementById("tabla-compras-recientes");
  if (!tabla) return;
  try {
    const lista = await comprasAPI.listarTodas();
    const recientes = [...lista]
      .sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra))
      .slice(0, 5);

    tabla.innerHTML = recientes.map((c) => `
      <tr>
        <td>#${c.idCompra}</td>
        <td>${c.nombreUsuario ?? "—"}</td>
        <td>${formatearFecha(c.fechaCompra)}</td>
        <td><span class="badge-estado badge-${c.estado?.toLowerCase()}">${c.estado}</span></td>
        <td>${formatearPrecio(c.total)}</td>
      </tr>
    `).join("");
  } catch (e) { console.error(e); }
}

function setMetrica(id, valor, esNumero = true) {
  const el = document.getElementById(id);
  if (el) el.textContent = esNumero ? valor : valor;
}

// ══════════════════════════════════════════════════════════════
//  PRODUCTOS (admin)
// ══════════════════════════════════════════════════════════════

/**
 * Punto de entrada para pages/admin/producto.html
 */
export async function initAdminProductos() {
  requireAdmin();
  initNavbar();
  await cargarTablaProductos();
  initModalProducto();
  initBusquedaAdmin("input-busqueda-producto", "tabla-productos-body", buscarEnTabla);
}

async function cargarTablaProductos() {
  const tbody    = document.getElementById("tabla-productos-body");
  const skeleton = document.getElementById("skeleton-productos-admin");
  if (!tbody) return;

  mostrarSkeleton(skeleton, true);

  try {
    const [lista, cats] = await Promise.all([
      productosAPI.listar(),
      categoriasAPI.listar(),
    ]);

    // Mapa idCategoria → nombre para resolver el nombre
    const catMap = Object.fromEntries(cats.map((c) => [c.idCategoria, c.nombre]));

    tbody.innerHTML = lista.map((p) => `
      <tr id="fila-producto-${p.idProducto}">
        <td>${p.idProducto}</td>
        <td>
          <img src="${p.imgUrl || "/frontend/assets/image/Shrek.jpg"}"
               alt="${p.nombreProducto}" class="thumb-tabla"
               onerror="this.src='/frontend/assets/image/Shrek.jpg'">
          ${p.nombreProducto}
        </td>
        <td>${catMap[p.idCategoria] ?? "—"}</td>
        <td>${formatearPrecio(p.precio)}</td>
        <td>${p.stock}</td>
        <td><span class="badge-estado badge-${p.estado}">${p.estado}</span></td>
        <td class="acciones-celda">
          <button class="btn-tabla btn-editar" data-id="${p.idProducto}" title="Editar">✏️</button>
          <button class="btn-tabla btn-eliminar" data-id="${p.idProducto}" title="Eliminar">🗑</button>
        </td>
      </tr>
    `).join("");

    // Guardar categorías para el formulario
    window._gc_categorias = cats;

    // Eventos de la tabla
    tbody.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prod = lista.find((p) => p.idProducto === parseInt(btn.dataset.id));
        abrirModalProducto(prod);
      });
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => confirmarEliminarProducto(parseInt(btn.dataset.id)));
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="error-tabla">Error al cargar productos.</td></tr>`;
    console.error(err);
  } finally {
    mostrarSkeleton(skeleton, false);
  }
}

// ── Modal Producto ─────────────────────────────────────────────

function initModalProducto() {
  const btnNuevo = document.getElementById("btn-nuevo-producto");
  btnNuevo?.addEventListener("click", () => abrirModalProducto(null));

  const modal = document.getElementById("modal-producto-admin");
  modal?.querySelector(".btn-cerrar-modal")
       ?.addEventListener("click", cerrarModalProducto);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModalProducto();
  });

  document.getElementById("form-producto")
    ?.addEventListener("submit", guardarProducto);
}

function abrirModalProducto(producto = null) {
  const modal  = document.getElementById("modal-producto-admin");
  const titulo = document.getElementById("modal-producto-titulo");
  const form   = document.getElementById("form-producto");
  if (!modal || !form) return;

  form.reset();
  poblarSelectCategorias("select-categoria-producto");

  if (producto) {
    titulo.textContent = "Editar producto";
    form.dataset.id    = producto.idProducto;
    setField(form, "nombre_producto",  producto.nombreProducto);
    setField(form, "descripcion",      producto.descripcion);
    setField(form, "precio",           producto.precio);
    setField(form, "stock",            producto.stock);
    setField(form, "img_url",          producto.imgUrl);
    setField(form, "id_categoria",     producto.idCategoria);
    setField(form, "estado",           producto.estado);
  } else {
    titulo.textContent = "Nuevo producto";
    delete form.dataset.id;
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarModalProducto() {
  const modal = document.getElementById("modal-producto-admin");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

async function guardarProducto(e) {
  e.preventDefault();
  const form    = e.target;
  const btnSave = form.querySelector("button[type='submit']");
  const idEditar = form.dataset.id ? parseInt(form.dataset.id) : null;

  const payload = {
    nombreProducto: getField(form, "nombre_producto"),
    descripcion:    getField(form, "descripcion"),
    precio:         parseFloat(getField(form, "precio")),
    stock:          parseInt(getField(form, "stock")),
    imgUrl:         getField(form, "img_url") || null,
    idCategoria:    parseInt(getField(form, "id_categoria")),
    estado:         getField(form, "estado") || "activo",
  };

  if (!payload.nombreProducto || isNaN(payload.precio) || isNaN(payload.idCategoria)) {
    mostrarToast("Completa los campos obligatorios.", "error");
    return;
  }

  setLoading(btnSave, true, "Guardando...");

  try {
    if (idEditar) {
      await productosAPI.actualizar(idEditar, payload);
      mostrarToast("Producto actualizado correctamente.", "success");
    } else {
      await productosAPI.crear(payload);
      mostrarToast("Producto creado correctamente.", "success");
    }
    cerrarModalProducto();
    await cargarTablaProductos();
  } catch (err) {
    mostrarToast(err.message || "No se pudo guardar el producto.", "error");
  } finally {
    setLoading(btnSave, false, "Guardar");
  }
}

async function confirmarEliminarProducto(id) {
  if (!window.confirm(`¿Eliminar el producto #${id}? Esta acción no se puede deshacer.`)) return;
  try {
    await productosAPI.eliminar(id);
    mostrarToast("Producto eliminado.", "info");
    document.getElementById(`fila-producto-${id}`)?.remove();
  } catch (err) {
    mostrarToast(err.message || "No se pudo eliminar el producto.", "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  CATEGORÍAS (admin)
// ══════════════════════════════════════════════════════════════

/**
 * Punto de entrada para pages/admin/categorias.html
 */
export async function initAdminCategorias() {
  requireAdmin();
  initNavbar();
  await cargarTablaCategorias();
  initModalCategoria();
  initBusquedaAdmin("input-busqueda-categoria", "tabla-categorias-body", buscarEnTabla);
}

async function cargarTablaCategorias() {
  const tbody = document.getElementById("tabla-categorias-body");
  if (!tbody) return;

  try {
    const lista = await categoriasAPI.listar();
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
      await categoriasAPI.actualizar(id, nombre, desc);
      mostrarToast("Categoría actualizada.", "success");
    } else {
      await categoriasAPI.crear(nombre, desc);
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
    await categoriasAPI.eliminar(id);
    mostrarToast("Categoría eliminada.", "info");
    document.getElementById(`fila-categoria-${id}`)?.remove();
  } catch (err) {
    mostrarToast(err.message || "No se pudo eliminar. Puede tener productos asociados.", "error");
  }
}

// ══════════════════════════════════════════════════════════════
//  USUARIOS (admin)
// ══════════════════════════════════════════════════════════════

/**
 * Punto de entrada para pages/admin/usuarios.html
 */
export async function initAdminUsuarios() {
  requireAdmin();
  initNavbar();
  await cargarTablaUsuarios();
  initBusquedaAdmin("input-busqueda-usuario", "tabla-usuarios-body", buscarEnTabla);
  initFiltroRol();
}

async function cargarTablaUsuarios() {
  const tbody = document.getElementById("tabla-usuarios-body");
  if (!tbody) return;

  try {
    const lista = await usuariosAPI.listarTodos();
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
    await usuariosAPI.cambiarRol(id, nuevoRol);
    mostrarToast(`Rol actualizado a ${nuevoRol}.`, "success");
    await cargarTablaUsuarios(); // refrescar tabla
  } catch (err) {
    mostrarToast(err.message || "No se pudo cambiar el rol.", "error");
    btn.disabled = false;
  }
}

async function confirmarEliminarUsuario(id, nombre) {
  if (!window.confirm(`¿Eliminar al usuario "${nombre}" (#${id})?\nEsta acción no se puede deshacer.`)) return;
  try {
    await usuariosAPI.eliminar(id);
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

// ══════════════════════════════════════════════════════════════
//  COMPRAS (admin)
// ══════════════════════════════════════════════════════════════

/**
 * Punto de entrada para pages/admin/compras.html
 */
export async function initAdminCompras() {
  requireAdmin();
  initNavbar();
  await cargarTablaCompras();
  initFiltroEstadoAdmin();
  initBusquedaAdmin("input-busqueda-compra", "tabla-compras-body", buscarEnTabla);
}

async function cargarTablaCompras() {
  const tbody = document.getElementById("tabla-compras-body");
  if (!tbody) return;

  try {
    const lista = await comprasAPI.listarTodas();
    const ordenadas = [...lista].sort(
      (a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)
    );

    tbody.innerHTML = ordenadas.map((c) => `
      <tr id="fila-compra-${c.idCompra}" class="fila-estado-${c.estado?.toLowerCase()}">
        <td>#${c.idCompra}</td>
        <td>${c.nombreUsuario ?? "—"}</td>
        <td>${formatearFecha(c.fechaCompra)}</td>
        <td>
          <select class="select-estado-compra"
                  data-id="${c.idCompra}"
                  data-actual="${c.estado?.toLowerCase()}">
            <option value="PENDIENTE" ${c.estado === "pendiente" ? "selected" : ""}>⏳ Pendiente</option>
            <option value="PAGADO"    ${c.estado === "pagado"    ? "selected" : ""}>✅ Pagado</option>
            <option value="CANCELADO" ${c.estado === "cancelado" ? "selected" : ""}>❌ Cancelado</option>
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
    await comprasAPI.cambiarEstado(id, nuevoEstado);
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
    const compra = await comprasAPI.verDetalle(idCompra); // llama como admin
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

// ══════════════════════════════════════════════════════════════
//  HELPERS COMPARTIDOS
// ══════════════════════════════════════════════════════════════

/** Carga el select de categorías en el formulario de producto */
function poblarSelectCategorias(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const cats = window._gc_categorias ?? [];
  select.innerHTML = `<option value="">— Selecciona categoría —</option>` +
    cats.map((c) => `<option value="${c.idCategoria}">${c.nombre}</option>`).join("");
}

/** Inicializa el input de búsqueda en tiempo real para una tabla */
function initBusquedaAdmin(inputId, tbodyId, callback) {
  const input = document.getElementById(inputId);
  if (!input) return;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(input.value, tbodyId), 250);
  });
}

/** Filtra las filas de una tabla según texto de búsqueda */
function buscarEnTabla(query, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const q = query.toLowerCase().trim();
  tbody.querySelectorAll("tr").forEach((fila) => {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = !q || texto.includes(q) ? "" : "none";
  });
}

/** Filtra filas de tabla con una función predicado */
function filtrarTabla(tbodyId, predicado) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.querySelectorAll("tr").forEach((fila) => {
    const resultado = predicado(fila);
    if (resultado === null) return; // ignorar filas especiales
    fila.style.display = resultado ? "" : "none";
  });
}

/** Obtiene el valor de un campo por name dentro de un form */
function getField(form, name) {
  return form.querySelector(`[name="${name}"]`)?.value?.trim() ?? "";
}

/** Establece el valor de un campo por name dentro de un form */
function setField(form, name, value) {
  const el = form.querySelector(`[name="${name}"]`);
  if (el) el.value = value ?? "";
}

/** Muestra / oculta skeleton */
function mostrarSkeleton(el, visible) {
  if (!el) return;
  el.style.display = visible ? "block" : "none";
}

/** Activa/desactiva estado de carga en un botón */
function setLoading(btn, loading, texto) {
  if (!btn) return;
  btn.disabled     = loading;
  btn.textContent  = texto;
}
