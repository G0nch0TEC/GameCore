import { request } from "../core/http.js";

//PRODUCTOS
export const productoService = {
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