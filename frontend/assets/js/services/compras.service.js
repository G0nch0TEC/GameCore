import { request } from "../core/http.js";
// COMPRAS
export const compraService = {
     /** POST /compras — confirmar carrito como compra */
  realizar: () => request("/compras", { method: "POST" }),

  /** PATCH /compras/{id}/pagar */
  pagar: (id) => request(`/compras/${id}/pagar`, { method: "PATCH" }),

  /** GET /compras — mis compras */
  misCompras: () => request("/compras"),

  /** GET /compras/admin/{id} — detalle de una compra propia (Cliente) */
  verDetalle: (id) => request(`/compras/${id}`),

  /** PATCH /compras/{id}/cancelar */
  cancelar: (id) => request(`/compras/${id}/cancelar`, { method: "PATCH" }),

  // ── Admin ──────────────────────────────────────────────────────────────────

  /** GET /compras/admin/todas (solo ADMIN) */
  listarTodas: () => request("/compras/admin/todas"),

    /** GET /compras/admin/{id} — detalle de cualquier compra (solo ADMIN) */
  verDetalleAdmin: (id) => request(`/compras/admin/${id}`),

  /** GET /compras/admin/estado?estado=PENDIENTE (solo ADMIN) */
  listarPorEstado: (estado) => request(`/compras/admin/estado?estado=${estado}`),

  /** PATCH /compras/admin/{id}/estado — cambiar estado (solo ADMIN) */
  cambiarEstado: (id, estado) => request(`/compras/admin/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  }),
};