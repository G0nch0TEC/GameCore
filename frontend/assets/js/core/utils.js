export function mostrarToast(mensaje, tipo = "success") {
  let container = document.getElementById("gc-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "gc-toast-container";
    container.style.cssText = `
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    success: "#22c55e",
    error:   "#ef4444",
    info:    "#3b82f6",
  };

  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.style.cssText = `
    padding: 0.75rem 1.25rem;
    background: ${colors[tipo] || colors.info};
    color: white;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 0.875rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.25s, transform 0.25s;
    max-width: 320px;
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Formatea un número como precio en soles peruanos.
 * @param {number} precio
 * @returns {string} ej: "S/ 49.90"
 */
export function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(precio);
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param {string} fechaISO
 * @returns {string} ej: "11 de abril de 2026, 18:30"
 */
export function formatearFecha(fechaISO) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(fechaISO));
}

/**
 * Guarda en localStorage el conteo de ítems del carrito
 * para mostrarlo en el badge del navbar.
 * @param {number} cantidad
 */
export function actualizarBadgeCarrito(cantidad) {
  const badge = document.getElementById("carrito-badge");
  if (badge) {
    badge.textContent = cantidad;
    badge.style.display = cantidad > 0 ? "inline-flex" : "none";
  }
  localStorage.setItem("gc_carrito_count", cantidad);
}

import { API_BASE } from "./http.js";

/**
 * Devuelve la URL correcta de una imagen de producto
 * soporta:
 * - rutas relativas (/uploads/x.jpg)
 * - URLs completas (http/https)
 * - base64 (data:)
 * - null/undefined (fallback)
 */
export function getProductImage(imgUrl) {
  const fallback = "/frontend/assets/image/Shrek.jpg";

  if (!imgUrl) return fallback;

  // ya es URL completa o base64
  if (imgUrl.startsWith("http") || imgUrl.startsWith("data:")) {
    return imgUrl;
  }

  // ruta relativa del backend
  return API_BASE + imgUrl;
}