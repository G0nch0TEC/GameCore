import { productoService } from "../services/producto.service.js";
import { usuarioService }  from "../services/usuario.service.js";
import { compraService }   from "../services/compras.service.js";
import { formatearPrecio, formatearFecha } from "../core/utils.js";
import { requireAdmin }    from "../core/routes.js";
import { initNavbar }      from "../pages/auth.page.js";
/**
 * Punto de entrada para dashboard.html
 * Muestra métricas generales del negocio.
 */
export async function initDashboard() {
  await requireAdmin();
  await initNavbar();

  await Promise.allSettled([
    cargarMetricaProductos(),
    cargarMetricaUsuarios(),
    cargarMetricaCompras(),
    cargarComprasRecientes(),
  ]);
}

async function cargarMetricaProductos() {
  try {
    const lista = await productoService.listar();
    setMetrica("metrica-total-productos", lista.length);
    setMetrica("metrica-productos-activos",
      lista.filter((p) => p.estado === "ACTIVO").length);   
    setMetrica("metrica-productos-agotados",
      lista.filter((p) => p.stock === 0).length);
  } catch (e) { console.error(e); }
}

async function cargarMetricaUsuarios() {
  try {
    const lista = await usuarioService.listarTodos();
    setMetrica("metrica-total-usuarios", lista.length);
    setMetrica("metrica-clientes",
      lista.filter((u) => u.rol === "CLIENTE").length);  
  } catch (e) { console.error(e); }
}

async function cargarMetricaCompras() {
  try {
    const lista = await compraService.listarTodas();
    const totalVentas = lista
      .filter((c) => c.estado === "PAGADO")               
      .reduce((acc, c) => acc + c.total, 0);
    setMetrica("metrica-total-compras", lista.length);
    setMetrica("metrica-ventas-totales", formatearPrecio(totalVentas), false);
    setMetrica("metrica-pendientes",
      lista.filter((c) => c.estado === "PENDIENTE").length);
  } catch (e) { console.error(e); }
}

async function cargarComprasRecientes() {
  const tabla = document.getElementById("tabla-compras-recientes");
  if (!tabla) return;
  try {
    const lista = await compraService.listarTodas();
    const recientes = [...lista]
      .sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra))
      .slice(0, 5);

    tabla.innerHTML = recientes.map((c) => `
      <tr>
        <td>#${c.idCompra}</td>
        <td>${c.idUsuario ?? "—"}</td>
        <td>${formatearFecha(c.fechaCompra)}</td>
        <td><span class="badge-estado badge-${c.estado?.toLowerCase()}">${c.estado}</span></td>
        <td>${formatearPrecio(c.total)}</td>
      </tr>
    `).join("");
  } catch (e) { console.error(e); }
}

function setMetrica(id, valor, esNumero = true) {
  const el = document.getElementById(id);
  if (el) el.textContent = esNumero ? valor : valor;
}