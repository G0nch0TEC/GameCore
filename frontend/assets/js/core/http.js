import { token } from "./storage.js";

const API_BASE = "http://localhost:8080";

export async function request(endpoint, options = {}, auth = true){
    const headers = {
        "Content-Type": "application/json",
        ...(auth && token.exists() ? { Authorization: `Bearer ${token.get()}`} : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    console.log("TOKEN:", token.get());
    console.log("HEADERS:", headers);
    //Sesion expirada o token inválido -> limpiar y redirigir
    if (res.status === 401){
        token.remove();
        localStorage.removeItem("gc_user");   
        window.location.href = "/index.html";
        throw new Error("Sesión expirada. Por favor, inicia sesion nuevamente.");
    }

    // para respuestas sin cuerpo
    let data = null;

    try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        data = null;
    }

    if (!res.ok) {
        let msg = data?.message || data?.error;

        if (!msg) {
        switch (res.status) {
            case 400:
                msg = "Solicitud inválida.";
                break;
            case 401:
                msg = "Sesión expirada. Inicia sesión nuevamente.";
                break;
            case 403:
                msg = "La contraseña actual es incorrecta o no tienes permiso.";
                break;
            case 404:
                msg = "Recurso no encontrado.";
                break;
            case 500:
                msg = "Error interno del servidor.";
                break;
            default:
                msg = `Error ${res.status}`;
            }
        }

        throw new Error(msg);
    }

    return data;
};