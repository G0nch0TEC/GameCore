const API_BASE = "http://localhost:8080";

//TOKEN HELPERS
export const token = {
  get:    ()        => localStorage.getItem("gc_token"),
  set:    (t)       => localStorage.setItem("gc_token", t),
  remove: ()        => localStorage.removeItem("gc_token"),
  exists: ()        => !!localStorage.getItem("gc_token"),
};

export const user = {
  get:    ()        => JSON.parse(localStorage.getItem("gc_user") || "null"),
  set:    (u)       => localStorage.setItem("gc_user", JSON.stringify(u)),
  remove: ()        => localStorage.removeItem("gc_user"),
  isAdmin:()        => user.get()?.rol === "admin",
};

//FETCH BASE
/**
 * Realiza una petición al backend.
 * @param {string} endpoint   - Ruta relativa, ej: "/productos"
 * @param {object} options    - Opciones fetch (method, body, etc.)
 * @param {boolean} auth      - Si debe incluir el JWT en el header
 * @returns {Promise<any>}    - Respuesta JSON del backend
 */
async function request(endpoint, options = {}, auth = true){
    const headers = {
        "Content-Type": "application/json",
        ...(auth && token.exists() ? { Authorization: `Bearer ${token.get()}`} : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    //Sesion expirada o token inválido -> limpiar y redirigir
    if (res.status === 401){
        token.remove();
        user.remove();
        window.location.href = "/index.html";
        throw new Error("Sesión expirada. Por favor, inicia sesion nuevamente.");
    }

    // para respuestas sin cuerpo
    if(res.status===204 || res.headers.get("Content-Lenght") === "0"){
    return null;
    }

    const data = await res.json();

    if (!res.ok) {
        const msg = data?.message || data?.error || `Error ${res.status}`;
        throw new Error(msg);
    }

    return data;
};

//AUTH
export const auth = {
    /**
   * Iniciar sesión
   * POST /auth/login
   * Body: { correo, contrasena }
   * Guarda token y datos del usuario en localStorage
   */
    login: async (correo, contrasena) => {
        const data = await request("/auth/login", {
            method: "POST",
            body:JSON.stringify({ correo, contrasena}),
        }, false);
        token.set(data.token);
        user.set({ nombre: data.nombre, rol: data.rol});
        return data;
    },

    /**
   * Registrar nuevo usuario
   * POST /auth/register
   * Body: { nombre, correo, contrasena }
   */
    register: async (nombre, correo, contrasena) => {
        const data = await request ("/auth/register", {
            method: "POST",
            body: JSON.stringify({ nombre, correo, contrasena }),
        }, false);
        token.set(data.token);
        user.set({ nombre: data.nombre, rol: data.rol });
        return data;
    },

    /** Cerrar sesíon - limpia token y usuario del localStorage */
    logout: () => {
        token.remove();
        user.remove();
        window.location.href = "/index.html";
    },
};

//PRODUCTOS
export const productos = {
    /** GET /productos — todos los productos */
  listar: () => request("/productos"),

  /** GET /productos/{id} */
  buscarPorId: (id) => request(`/productos/${id}`),

  /** GET /productos/buscar?nombre=... */
  buscarPorNombre: (nombre) => request(`/productos/buscar?nombre=${encodeURIComponent(nombre)}`),

  /** GET /productos/categoria/{idCategoria} */
  listarPorCategoria: (idCategoria) => request(`/productos/categoria/${idCategoria}`),

  /** GET /productos/disponibles */
  listarDisponibles: () => request("/productos/disponibles"),

  /** GET /productos/precio?min=...&max=... */
  listarPorPrecio: (min, max) => request(`/productos/precio?min=${min}&max=${max}`),

  /** GET /productos/ordenados — ordenados por precio ASC */
  listarOrdenados: () => request("/productos/ordenados"),

  /** GET /productos/paginado?page=0&size=10 */
  listarPaginado: (page = 0, size = 10) => request(`/productos/paginado?page=${page}&size=${size}`),

  // ADMIN

  /** POST /producto/admin - crear producto*/
  crear: (productoData) => request("/productos/admin", {
    method: "POST",
    body: JSON.stringify(productoData),
  }),

  /** PATCH /productos/admin/{id} - actualizar */
  actualizar: (id, productoData) => request(`/productos/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productoData),
  }),

  /** DELETE /productos/admin/{id} - eliminar */
  eliminar: (id) => request(`/productos/admin/${id}`, { method: "DELETE" }),
};

// CATEGORÍAS
export const categorias = {
  /** GET /categorias */
  listar: () => request("/categorias"),

  /** GET /categorias/{id} */
  buscarPorId: (id) => request(`/categorias/${id}`),

  // ── Admin ──────────────────────────────────────────────────────────────────

  /** POST /categorias/admin */
  crear: (nombre, descripcion) => request("/categorias/admin", {
    method: "POST",
    body: JSON.stringify({ nombre, descripcion }),
  }),

  /** PATCH /categorias/admin/{id} */
  actualizar: (id, nombre, descripcion) => request(`/categorias/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nombre, descripcion }),
  }),

  /** DELETE /categorias/admin/{id} */
  eliminar: (id) => request(`/categorias/admin/${id}`, { method: "DELETE" }),
};

// CARRITO 
export const carrito = {
    /** GET /carrito - ver mi carrito */ 
    ver: () => request("/carrito"),

    /** POST */
    agregar: (idProducto, cantidad = 1) =>
        request(`/carrito/items?idProducto=${idProducto}&cantidad=${cantidad}`, {
            method: "POST",
        }),

    /** PATCH */
    actualizarCantidad: (idDetalle, cantidad) =>
        request(`/carrito/items/${idDetalle}?cantidad=${cantidad}`, {
            method: "PACTCH",
        }),

    /** DELETE quitar item */
    eliminarItem: (idDetalle) =>
        request(`/carrito/items/${idDetalle}`, { method: "DELETE" }),

    /** DELETE - vaciar carrito */
    vaciar: () => request("/carrito", { method: "DELETE" }),
};

// COMPRAS
export const compras = {
     /** POST /compras — confirmar carrito como compra */
  realizar: () => request("/compras", { method: "POST" }),

  /** GET /compras — mis compras */
  misCompras: () => request("/compras"),

  /** GET /compras/{id} — detalle de una compra propia */
  verDetalle: (id) => request(`/compras/${id}`),

  /** PATCH /compras/{id}/cancelar */
  cancelar: (id) => request(`/compras/${id}/cancelar`, { method: "PATCH" }),

  // ── Admin ──────────────────────────────────────────────────────────────────

  /** GET /compras/admin/todas (solo ADMIN) */
  listarTodas: () => request("/compras/admin/todas"),

  /** GET /compras/admin/estado?estado=PENDIENTE (solo ADMIN) */
  listarPorEstado: (estado) => request(`/compras/admin/estado?estado=${estado}`),

  /** PATCH /compras/admin/{id}/estado — cambiar estado (solo ADMIN) */
  cambiarEstado: (id, estado) => request(`/compras/admin/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  }),
};

// USUARIOS
export const usuarios = {
    /** GET - ver mi perfil */
    verPerfil: () => request("/usuarios/perfil"),

    /** PATCH - actualizar nombre y/o correo */
    actualizarPerfil: (nombre, correo) => request("/usuarios/perfil", {
        method: "PATCH",
        body: JSON.stringify({ nombre, correo}),
    }),

    /** PATCH - cambiar contraseña */
    cambiarContrasena: (contrasenaActual, contrasenaNueva) => request("usuarios/contrasena", {
        method: "PATCH",
        body: JSON.stringify({ contrasenaActual, contrasenaNueva })
    }), 

    // ADMIN
    /** GET /usuarios/admin/todos (solo ADMIN) */
    listarTodos: () => request("/usuarios/admin/todos"),

    /** GET /usuarios/admin/rol?rol=CLIENTE (solo ADMIN) */
    listarPorRol: (rol) => request(`/usuarios/admin/rol?rol=${rol}`),

    /** GET /usuarios/admin/{id} (solo ADMIN) */
    buscarPorId: (id) => request(`/usuarios/admin/${id}`),

    /** PATCH /usuarios/admin/{id}/rol (solo ADMIN) */
    cambiarRol: (id, rol) => request(`/usuarios/admin/${id}/rol`, {
        method: "PATCH",
        body: JSON.stringify({ rol }),
    }),

    /** DELETE /usuarios/admin/{id} (solo ADMIN) */
    eliminar: (id) => request(`/usuarios/admin/${id}`, { method: "DELETE" }),
}

// UTILS
/**
 * Muestra un toast de notificación en pantalla.
 * @param {string} mensaje
 * @param {"success"|"error"|"info"} tipo
 */
export function mostrarToast(mensaje, tipo = "success") {
  let container = document.getElementById("gc-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "gc-toast-container";
    container.style.cssText = `
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    success: "#22c55e",
    error:   "#ef4444",
    info:    "#3b82f6",
  };

  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.style.cssText = `
    padding: 0.75rem 1.25rem;
    background: ${colors[tipo] || colors.info};
    color: white;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 0.875rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.25s, transform 0.25s;
    max-width: 320px;
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Formatea un número como precio en soles peruanos.
 * @param {number} precio
 * @returns {string} ej: "S/ 49.90"
 */
export function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(precio);
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param {string} fechaISO
 * @returns {string} ej: "11 de abril de 2026, 18:30"
 */
export function formatearFecha(fechaISO) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(fechaISO));
}

/**
 * Guarda en localStorage el conteo de ítems del carrito
 * para mostrarlo en el badge del navbar.
 * @param {number} cantidad
 */
export function actualizarBadgeCarrito(cantidad) {
  const badge = document.getElementById("carrito-badge");
  if (badge) {
    badge.textContent = cantidad;
    badge.style.display = cantidad > 0 ? "inline-flex" : "none";
  }
  localStorage.setItem("gc_carrito_count", cantidad);
}

