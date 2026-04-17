import { token, user } from "./storage.js";
import { request } from "./http.js";

/** Páginas de autenticación — si estamos aquí, no redirigir al login en bucle */
const AUTH_PAGES = ["/index.html", "/", "/frontend/pages/register.html"];

function isOnAuthPage() {
  const path = window.location.pathname;
  return AUTH_PAGES.some(p => path === p || path.endsWith(p));
}

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
  if (!token.exists()) return; // ya redirigió arriba

  try {
    const perfil = await request("/usuarios/perfil");
    user.set({ id: perfil.idUsuario, nombre: perfil.nombre, rol: perfil.rol });

    if (perfil.rol !== "ADMIN"){
      window.location.href = "/frontend/pages/productos.html";
    }
  } catch {
    // Solo redirigir al login si no estamos ya en una página de auth
    // (evita loop si el backend falla transitoriamente)
    if (!isOnAuthPage()) {
      token.remove();
      user.remove();
      window.location.href = "/index.html";
    }
  }
}

/**
 * Llama esto en index.html (login/register).
 * Si ya está autenticado → redirige según su rol.
 * Usa el rol guardado en localStorage para evitar un request innecesario
 * que podría fallar y causar un loop de redirección.
 */
export function redirectIfLogged() {
  if (!token.exists()) return;

  // Usar el rol ya guardado en localStorage para no hacer un fetch
  // que, si falla, nos devuelve al index en loop infinito
  const cached = user.get();
  if (cached?.rol) {
    if (cached.rol === "ADMIN") {
      window.location.href = "/frontend/pages/admin/dashboard.html";
    } else {
      window.location.href = "/frontend/pages/productos.html";
    }
    return;
  }

  // Si no hay rol cacheado, intentar con el servidor pero sin redirigir al
  // index en el catch (ya estamos en el index → loop)
  redirectByRole();
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
    // Si falla el perfil y NO estamos en el index, limpiar sesión y redirigir
    // Si YA estamos en el index, NO redirigir (eso causaría el loop infinito)
    if (!isOnAuthPage()) {
      token.remove();
      user.remove();
      window.location.href = "/index.html";
    }
    // Si estamos en el index, simplemente no hacer nada —
    // el usuario verá el formulario de login normalmente
  }
}