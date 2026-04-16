/** Carga el select de categorías en el formulario de producto */
export function poblarSelectCategorias(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const cats = window._gc_categorias ?? [];
  select.innerHTML = `<option value="">— Selecciona categoría —</option>` +
    cats.map((c) => `<option value="${c.idCategoria}">${c.nombre}</option>`).join("");
}

/** Inicializa el input de búsqueda en tiempo real para una tabla */
export function initBusquedaAdmin(inputId, tbodyId, callback) {
  const input = document.getElementById(inputId);
  if (!input) return;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(input.value, tbodyId), 250);
  });
}

/** Filtra las filas de una tabla según texto de búsqueda */
export function buscarEnTabla(query, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const q = query.toLowerCase().trim();
  tbody.querySelectorAll("tr").forEach((fila) => {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = !q || texto.includes(q) ? "" : "none";
  });
}

/** Filtra filas de tabla con una función predicado */
export function filtrarTabla(tbodyId, predicado) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.querySelectorAll("tr").forEach((fila) => {
    const resultado = predicado(fila);
    if (resultado === null) return; // ignorar filas especiales
    fila.style.display = resultado ? "" : "none";
  });
}

/** Obtiene el valor de un campo por name dentro de un form */
 export function getField(form, name) {
  return form.querySelector(`[name="${name}"]`)?.value?.trim() ?? "";
}

/** Establece el valor de un campo por name dentro de un form */
export function setField(form, name, value) {
  const el = form.querySelector(`[name="${name}"]`);
  if (el) el.value = value ?? "";
}

/** Muestra / oculta skeleton */
export function mostrarSkeleton(el, visible) {
  if (!el) return;
  el.style.display = visible ? "block" : "none";
}

/** Activa/desactiva estado de carga en un botón */
export function setLoading(btn, loading, texto) {
  if (!btn) return;
  btn.disabled     = loading;
  btn.textContent  = texto;
}