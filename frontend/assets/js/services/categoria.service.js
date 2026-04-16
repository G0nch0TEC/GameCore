import { request } from "../core/http.js";
// CATEGORÍAS
export const categoriaService = {
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