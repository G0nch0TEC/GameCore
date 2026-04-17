import { categoriaService } from "../services/categoria.service.js";
import { productoService } from "../services/producto.service.js";
import { formatearPrecio, mostrarToast } from "../core/utils.js";
import { requireAdmin }    from "../core/routes.js";
import { initNavbar }      from "../pages/auth.page.js";
import { API_BASE }        from "../core/http.js";
import { buscarEnTabla, mostrarSkeleton, setLoading, poblarSelectCategorias, initBusquedaAdmin, getField, setField } from "./admin.utils.js";
/**
 * Punto de entrada para pages/admin/producto.html
 */
export async function initAdminProductos() {
  await requireAdmin();
  await initNavbar();
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
      productoService.listar(),
      categoriaService.listar(),
    ]);

    // Mapa idCategoria → nombre para resolver el nombre
    const catMap = Object.fromEntries(cats.map((c) => [c.idCategoria, c.nombre]));

    tbody.innerHTML = lista.map((p) => `
      <tr id="fila-producto-${p.idProducto}">
        <td>${p.idProducto}</td>
      <td>
          <img src="${p.imgUrl ? API_BASE + p.imgUrl : '/frontend/assets/image/Shrek.jpg'}"
            alt="${p.nombreProducto}"
            class="thumb-tabla"
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

  // ── Preview al escribir/pegar una URL → limpiar archivo ──
  document.getElementById("fp-img")?.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    if (url) {
      // Si el usuario escribe una URL, descartar cualquier archivo seleccionado
      const fileInput = document.getElementById("fp-img-file");
      if (fileInput) fileInput.value = "";
    }
    mostrarPreviewImagen(url);
  });

  // ── Subir archivo → limpiar URL y mostrar preview comprimido ──
  document.getElementById("fp-img-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];

    // Si se desmarca el archivo (Cancel en el diálogo), limpiar preview
    if (!file) {
      mostrarPreviewImagen("");
      return;
    }

    // Limpiar el campo URL para evitar doble envío
    const urlInput = document.getElementById("fp-img");
    if (urlInput) urlInput.value = "";

    comprimirImagen(file, 600, 0.75).then((base64) => {
      mostrarPreviewImagen(base64);
    });
  });
}

/** Muestra u oculta la vista previa de imagen */
function mostrarPreviewImagen(src) {
  const wrap = document.getElementById("img-preview-wrap");
  const img  = document.getElementById("img-preview");
  if (!wrap || !img) return;

  if (src) {
    img.src = src;
    wrap.style.display = "block";
  } else {
    wrap.style.display = "none";
    img.src = "";
  }
}

function abrirModalProducto(producto = null) {
  const modal  = document.getElementById("modal-producto-admin");
  const titulo = document.getElementById("modal-producto-titulo");
  const form   = document.getElementById("form-producto");
  if (!modal || !form) return;

  form.reset();

  // Limpiar el input file y el preview al abrir el modal
  const fileInput = document.getElementById("fp-img-file");
  if (fileInput) fileInput.value = "";
  mostrarPreviewImagen("");

  poblarSelectCategorias("select-categoria-producto");

  if (producto) {
    titulo.textContent = "Editar producto";
    form.dataset.id    = producto.idProducto;
    setField(form, "nombre_producto",  producto.nombreProducto);
    setField(form, "descripcion",      producto.descripcion);
    setField(form, "precio",           producto.precio);
    setField(form, "stock",            producto.stock);
    setField(form, "id_categoria",     producto.idCategoria);
    setField(form, "estado",           producto.estado);

    // Mostrar preview si ya tiene imagen
    if (producto.imgUrl) mostrarPreviewImagen(producto.imgUrl);
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
  const fileInput = document.getElementById("fp-img-file");
  const urlManual = getField(form, "fp-img") || document.getElementById("fp-img")?.value?.trim();
  let imgUrl = null;

  // Si el usuario selecciona una imagen,
  // se envía al backend usando FormData para que se guarde en el servidor y devuelva una URL;
  // si no, se usa la URL ingresada manualmente
  if (fileInput?.files?.[0]) {
  const formData = new FormData();
  formData.append("imagen", fileInput.files[0]);

  const res = await fetch(`${API_BASE}/productos/admin/upload-imagen`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("gc_token")}`
    },
    body: formData,
  });

    if (!res.ok) throw new Error("Error al subir la imagen");

    const data = await res.json();
    imgUrl = data.imgUrl;

    } else if (urlManual) {
      imgUrl = urlManual;
    }

  const payload = {
    nombre:         getField(form, "nombre_producto"),
    descripcion:    getField(form, "descripcion"),
    precio:         parseFloat(getField(form, "precio")),
    stock:          parseInt(getField(form, "stock")),
    imgUrl: imgUrl,
    idCategoria:    parseInt(getField(form, "id_categoria")),
    estado:         getField(form, "estado") || "activo",
  };

  if (!payload.nombre || isNaN(payload.precio) || isNaN(payload.idCategoria)) {
    mostrarToast("Completa los campos obligatorios.", "error");
    return;
  }

  setLoading(btnSave, true, "Guardando...");

  try {
    if (idEditar) {
      await productoService.actualizar(idEditar, payload);
      mostrarToast("Producto actualizado correctamente.", "success");
    } else {
      await productoService.crear(payload);
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
    await productoService.eliminar(id);
    mostrarToast("Producto eliminado.", "info");
    document.getElementById(`fila-producto-${id}`)?.remove();
  } catch (err) {
    mostrarToast(err.message || "No se pudo eliminar el producto.", "error");
  }
}

// ── Utilidad: redimensiona y comprime una imagen antes de enviarla ──
// maxPx  → lado máximo en píxeles (ej. 600)
// quality → calidad JPEG 0-1 (ej. 0.75)
function comprimirImagen(file, maxPx = 600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calcular nuevo tamaño manteniendo proporciones
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) {
            height = Math.round((height * maxPx) / width);
            width  = maxPx;
          } else {
            width  = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        // Exportar como JPEG comprimido
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
