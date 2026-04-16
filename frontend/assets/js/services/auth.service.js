import { request } from "../core/http.js";
import { token, user } from "../core/storage.js";

//AUTH
export const authService = {
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

        // ahora sí pedimos el perfil (ya tenemos token para autenticarnos)
        const perfil = await request("/usuarios/perfil");
        user.set({ id: perfil.idUsuario, nombre: perfil.nombre, rol: perfil.rol});

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

        const perfil = await request("/usuarios/perfil");
        user.set({ id: perfil.idUsuario, nombre: perfil.nombre, rol: perfil.rol });
        return data;
    },

    /** Cerrar sesíon - limpia token y usuario del localStorage */
    logout: () => {
        token.remove();
        user.remove();
        window.location.href = "/index.html";
    },
};