import { request } from "../core/http.js";
// CARRITO 
export const carritoService = {
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
            method: "PATCH",
        }),

    /** DELETE quitar item */
    eliminarItem: (idDetalle) =>
        request(`/carrito/items/${idDetalle}`, { method: "DELETE" }),

    /** DELETE - vaciar carrito */
    vaciar: () => request("/carrito", { method: "DELETE" }),
};