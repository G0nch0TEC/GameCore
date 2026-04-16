import { token, user } from "./storage.js";
import { request } from "./http.js";
/**
 * Llama esto en cualquier página que requiera estar autenticado.
 * Si no hay token → redirige al login.
 */
export function requireAuth() {
  if (!token.exists()) {
    window.location.href = "/index.html";
  }
}

/**
 * Llama esto en páginas exclusivas para ADMIN.
 * Si no es admin → redirige a productos (área cliente).
 */
export async function requireAdmin() {
  requireAuth();

  try {
    const perfil = await request("/usuarios/perfil");
    user.set({ id: perfil.idUsuario, nombre: perfil.nombre, rol: perfil.rol });

    if (perfil.rol !== "ADMIN"){
      window.location.href = "/frontend/pages/productos.html";
    }
  } catch {
    window.location.href = "/index.html";
  }
}

/**
 * Llama esto en index.html (login/register).
 * Si ya está autenticado → redirige según su rol.
 */
export function redirectIfLogged() {
  if (token.exists()) {
    redirectByRole();
  }
}

/** Redirige según el rol del usuario autenticado */
export async function redirectByRole() {
  try {
    const perfil = await request("/usuarios/perfil");
    user.set({ id: perfil.idUsuario, nombre: perfil.nombre, rol: perfil.rol });

    if (perfil.rol === "ADMIN") {
      window.location.href = "/frontend/pages/admin/dashboard.html";
    } else {
      window.location.href = "/frontend/pages/productos.html";
    }
  } catch {
    window.location.href = "/index.html";
  }
}