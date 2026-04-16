import { authService } from "../services/auth.service.js";
import { user }                               from "../core/storage.js";
import { mostrarToast }                       from "../core/utils.js";
import { redirectIfLogged, redirectByRole }   from "../core/routes.js";

export function initLogin() {
  redirectIfLogged();

  const form = document.getElementById("form-login");
  if (!form) return;

  const btnSubmit  = form.querySelector("button[type='submit']");
  const inputEmail = document.getElementById("login-correo");
  const inputPass  = document.getElementById("login-contrasena");
  const errorDiv   = document.getElementById("login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(errorDiv);
    setLoading(btnSubmit, true, "Ingresando...");

    const correo    = inputEmail.value.trim();
    const contrasena = inputPass.value;

    if (!correo || !contrasena) {
      showError(errorDiv, "Por favor completa todos los campos.");
      setLoading(btnSubmit, false, "Ingresar");
      return;
    }

    try {
      await authService.login(correo, contrasena);
      mostrarToast("¡Bienvenido de vuelta!", "success");
      setTimeout(redirectByRole, 600);
    } catch (err) {
      showError(errorDiv, err.message || "Credenciales incorrectas.");
      setLoading(btnSubmit, false, "Ingresar");
    }
  });

  // Limpiar error al escribir
  [inputEmail, inputPass].forEach((el) =>
    el.addEventListener("input", () => clearError(errorDiv))
  );
}

// ─── FORMULARIO DE REGISTRO ───────────────────────────────────────────────────

/**
 * Inicializa el formulario de registro.
 * Busca el form con id="form-register" en el DOM.
 */
export function initRegister() {
  redirectIfLogged();

  const form = document.getElementById("form-register");
  if (!form) return;

  const btnSubmit   = form.querySelector("button[type='submit']");
  const inputNombre = document.getElementById("reg-nombre");
  const inputEmail  = document.getElementById("reg-correo");
  const inputPass   = document.getElementById("reg-contrasena");
  const inputPass2  = document.getElementById("reg-contrasena2");
  const errorDiv    = document.getElementById("register-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(errorDiv);

    const nombre    = inputNombre.value.trim();
    const correo    = inputEmail.value.trim();
    const contrasena = inputPass.value;
    const contrasena2 = inputPass2?.value;

    // Validaciones
    if (!nombre || !correo || !contrasena) {
      showError(errorDiv, "Por favor completa todos los campos.");
      return;
    }
    if (nombre.length < 2) {
      showError(errorDiv, "El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!isValidEmail(correo)) {
      showError(errorDiv, "Ingresa un correo electrónico válido.");
      return;
    }
    if (contrasena.length < 6) {
      showError(errorDiv, "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (inputPass2 && contrasena !== contrasena2) {
      showError(errorDiv, "Las contraseñas no coinciden.");
      return;
    }

    setLoading(btnSubmit, true, "Registrando...");

    try {
      await authService.register(nombre, correo, contrasena);
      mostrarToast("¡Cuenta creada con éxito!", "success");
      setTimeout(redirectByRole, 600);
    } catch (err) {
      showError(errorDiv, err.message || "No se pudo crear la cuenta.");
      setLoading(btnSubmit, false, "Crear cuenta");
    }
  });

  // Limpiar errores al escribir
  [inputNombre, inputEmail, inputPass, inputPass2].forEach((el) => {
    if (el) el.addEventListener("input", () => clearError(errorDiv));
  });
}

// ─── NAVBAR — INFO DE SESIÓN ──────────────────────────────────────────────────

/**
 * Inicializa el navbar según el estado de sesión.
 * - Muestra el nombre del usuario
 * - Muestra/oculta links de admin
 * - Conecta el botón de logout
 *
 * Usa estos IDs en el navbar:
 *   #nav-user-name, #nav-admin-links, #btn-logout
 */
export function initNavbar() {
  const nameEl      = document.getElementById("nav-user-name");
  const adminLinks  = document.getElementById("nav-admin-links");
  const logoutBtn   = document.getElementById("btn-logout");

  const currentUser = user.get();

  if (currentUser) {
    if (nameEl) nameEl.textContent = currentUser.nombre;

    if (adminLinks) {
      adminLinks.style.display = user.isAdmin() ? "flex" : "none";
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authService.logout();
    });
  }

  // Badge del carrito — restaurar desde localStorage
  const count = parseInt(localStorage.getItem("gc_carrito_count") || "0");
  const badge = document.getElementById("carrito-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }

  // Rellenar nombre en topbar admin (si existe el elemento)
  const topbarName = document.getElementById("topbar-admin-name");
  if (topbarName) {
    const u = user.get(); // ya viene fresco porque requireAdmin() corrió primero
    if (u?.nombre) topbarName.textContent = u.nombre;
  }
}

// ─── TOGGLE MOSTRAR/OCULTAR CONTRASEÑA ───────────────────────────────────────

/**
 * Conecta botones de tipo "ojo" para mostrar/ocultar contraseñas.
 * Uso en HTML:
 *   <button class="toggle-pass" data-target="login-contrasena">👁</button>
 */
export function initPasswordToggles() {
  document.querySelectorAll(".toggle-pass").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.dataset.target;
      const input   = document.getElementById(inputId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
      } else {
        input.type = "password";
        btn.textContent = "👁";
      }
    });
  });
}

// ─── HELPERS INTERNOS ─────────────────────────────────────────────────────────

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function clearError(el) {
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

function setLoading(btn, loading, text) {
  if (!btn) return;
  btn.disabled  = loading;
  btn.textContent = text;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
