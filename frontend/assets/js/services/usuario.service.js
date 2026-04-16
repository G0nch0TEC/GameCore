import { request } from "../core/http.js";
// USUARIOS
export const usuarioService = {
    /** GET - ver mi perfil */
    verPerfil: () => request("/usuarios/perfil"),

    /** PATCH - actualizar nombre y/o correo */
    actualizarPerfil: (nombre, correo) => request("/usuarios/perfil", {
        method: "PATCH",
        body: JSON.stringify({ nombre, correo}),
    }),

    /** PATCH - cambiar contraseña */
    cambiarContrasena: (contrasenaActual, contrasenaNueva) => request("/usuarios/contrasena", {
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
