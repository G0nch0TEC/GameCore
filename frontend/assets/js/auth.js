import {auth, token, user, mostrarToast} from "./api.js"

//PROTECCION DE RUTAS

/** Si no hay token -> redirige al login */
export function requireAuth(){
    if (!token.exists()) {
        window.location.href = "/index.html"
    }
}

/** Si no es admin -> redirige a productos (área cliente) */
export function requireAdmin(){
    requireAuth();
    if(!user.isAdmin()){
        window.location.href = "/frontend/pages/productos.html";
    }
}

/** Si ya esta autenticado -> redirige según su rol */
export function redirectIfLogged(){
    if(token.exists()){
        redirectByRole();
    }
}

/** redirige segun su rol */
function redirectByRole(){
    if(user.isAdmin()){
        window.location.href = "/frontend/pages/admin/dashboard.html";
    } else {
        window.location.href = "/frontend/pages/productos.html";
    }
}

// FORMULARIO DE LOGIN

/** inicializa el formulario de login */
export function initLogin(){
    redirectIfLogged();

    const form = document.getElementById("form-login");
    if (!form) return;

    const btnSubmit = form.querySelector("button[type='submit']");
    const inputEmail = form.querySelector("login-correo");
    const inputPass = form.querySelector("login-contrasena");
    const errorDiv = form.querySelector("login-error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError(errorDiv);
        setLoading(btnSubmit, true, "Ingresando...");

        const correo = inputEmail.value.trim();
        const contrasena = inputPass.value;

        if (!correo || !contrasena) {
            showError(errorDiv, "Por favor completa todos los campos.");
            setLoading(btnSubmit, false, "Ingresar");
            return;
        }

        try {
            await auth.login(correo, contrasena);
            mostrarToast("!Bienvenido de vuelta!", "success");
            setTimeout(redirectByRole, 600);
        } catch (err) {
            showError(errorDiv, err.message || "Credenciales incorrectas.");
            setLoading(btnSubmit, false, "Ingresar");
        }
    });

    // Limpar error al escribir
    [inputEmail, inputPass].forEach((el) =>
        el.addEventListener("input", () => clearError(errorDiv))
    );
}

// FORMULARIO DE REGISTRO

/** Inicializar el formulario de registro. */