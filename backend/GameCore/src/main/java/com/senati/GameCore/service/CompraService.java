package com.senati.GameCore.service;

import com.senati.GameCore.dto.CompraResponse;
import com.senati.GameCore.model.*;
import com.senati.GameCore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository          compraRepository;
    private final DetalleCompraRepository   detalleCompraRepository;
    private final CarritoRepository         carritoRepository;
    private final CarritoDetalleRepository  carritoDetalleRepository;
    private final ProductoRepository        productoRepository;
    private final UsuarioRepository         usuarioRepository;

    public CompraService(CompraRepository compraRepository,
                         DetalleCompraRepository detalleCompraRepository,
                         CarritoRepository carritoRepository,
                         CarritoDetalleRepository carritoDetalleRepository,
                         ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository) {
        this.compraRepository         = compraRepository;
        this.detalleCompraRepository  = detalleCompraRepository;
        this.carritoRepository        = carritoRepository;
        this.carritoDetalleRepository = carritoDetalleRepository;
        this.productoRepository       = productoRepository;
        this.usuarioRepository        = usuarioRepository;
    }

    // ─── CLIENTE ──────────────────────────────────────────────────────────────

    // Convierte el carrito actual en una compra
    @Transactional
    public CompraResponse realizarCompra(Integer idUsuario) {

        // 1. Obtener carrito del usuario
        Carrito carrito = carritoRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado para usuario: " + idUsuario));

        // 2. Obtener items del carrito
        List<CarritoDetalle> items = carritoDetalleRepository
                .findByIdCarrito(carrito.getIdCarrito());

        if (items.isEmpty()) {
            throw new RuntimeException("El carrito está vacío, no se puede realizar la compra");
        }

        // 3. Validar stock de todos los productos antes de proceder
        for (CarritoDetalle item : items) {
            Producto producto = item.getProducto();
            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombreProducto()
                        + ". Disponible: " + producto.getStock()
                        + ", solicitado: " + item.getCantidad());
            }
        }

        // 4. Obtener usuario
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + idUsuario));

        // 5. Crear la compra
        Compra compra = new Compra();
        compra.setUsuario(usuario);
        compra.setEstado(Compra.Estado.PENDIENTE);
        compra.setTotal(BigDecimal.ZERO); // se calcula abajo
        compraRepository.save(compra);

        // 6. Crear un DetalleCompra por cada item y descontar stock
        BigDecimal total = BigDecimal.ZERO;

        for (CarritoDetalle item : items) {
            Producto producto = item.getProducto();

            // Guardar el precio al momento de la compra (precio histórico)
            DetalleCompra detalle = new DetalleCompra();
            detalle.setCompra(compra);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalleCompraRepository.save(detalle);

            // Descontar stock
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            // Acumular total
            total = total.add(producto.getPrecio()
                    .multiply(BigDecimal.valueOf(item.getCantidad())));
        }

        // 7. Actualizar el total real en la compra
        compra.setTotal(total);
        compraRepository.save(compra);

        // 8. Vaciar el carrito
        carritoDetalleRepository.clearByIdCarrito(carrito.getIdCarrito());

        // 9. Retornar respuesta
        List<DetalleCompra> detalles = detalleCompraRepository.findByIdCompra(compra.getIdCompra());
        return new CompraResponse(compra, detalles);
    }

    // Historial de compras del usuario autenticado
    @Transactional(readOnly = true)
    public List<CompraResponse> misCompras(Integer idUsuario) {
        return compraRepository.findByIdUsuario(idUsuario)
                .stream()
                .map(c -> new CompraResponse(c, detalleCompraRepository.findByIdCompra(c.getIdCompra())))
                .toList();
    }

    // Ver detalle de una compra propia
    @Transactional(readOnly = true)
    public CompraResponse verCompra(Integer idUsuario, Integer idCompra) {
        Compra compra = compraRepository.findById(idCompra)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada: " + idCompra));

        // Verificar que la compra pertenezca al usuario
        if (!compra.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("La compra no pertenece al usuario autenticado");
        }

        List<DetalleCompra> detalles = detalleCompraRepository.findByIdCompra(idCompra);
        return new CompraResponse(compra, detalles);
    }

    // Pagar compra propia — solo si está PENDIENTE
    @Transactional
    public CompraResponse pagarCompra(Integer idUsuario, Integer idCompra) {
        Compra compra = compraRepository.findById(idCompra)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada: " + idCompra));

        if (!compra.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("La compra no pertenece al usuario autenticado");
        }

        if (compra.getEstado() != Compra.Estado.PENDIENTE) {
            throw new RuntimeException("Solo se pueden pagar compras en estado PENDIENTE");
        }

        compra.setEstado(Compra.Estado.PAGADO);
        compraRepository.save(compra);

        List<DetalleCompra> detalles = detalleCompraRepository.findByIdCompra(idCompra);
        return new CompraResponse(compra, detalles);
    }

    // Cancelar compra propia — solo si está PENDIENTE
    @Transactional
    public CompraResponse cancelarCompra(Integer idUsuario, Integer idCompra) {
        Compra compra = compraRepository.findById(idCompra)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada: " + idCompra));

        if (!compra.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("La compra no pertenece al usuario autenticado");
        }

        if (compra.getEstado() != Compra.Estado.PENDIENTE) {
            throw new RuntimeException("Solo se pueden cancelar compras en estado PENDIENTE");
        }

        // Devolver stock a cada producto
        List<DetalleCompra> detalles = detalleCompraRepository.findByIdCompra(idCompra);
        for (DetalleCompra detalle : detalles) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);
        }

        compra.setEstado(Compra.Estado.CANCELADO);
        compraRepository.save(compra);

        return new CompraResponse(compra, detalles);
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    // Listar todas las compras
    @Transactional(readOnly = true)
    public List<CompraResponse> listarTodas() {
        return compraRepository.findAll()
                .stream()
                .map(c -> new CompraResponse(c, detalleCompraRepository.findByIdCompra(c.getIdCompra())))
                .toList();
    }

    // Filtrar por estado
    @Transactional(readOnly = true)
    public List<CompraResponse> listarPorEstado(Compra.Estado estado) {
        return compraRepository.findByEstado(estado)
                .stream()
                .map(c -> new CompraResponse(c, detalleCompraRepository.findByIdCompra(c.getIdCompra())))
                .toList();
    }

    // Cambiar estado manualmente — uso admin
    @Transactional
    public CompraResponse cambiarEstado(Integer idCompra, Compra.Estado nuevoEstado) {
        Compra compra = compraRepository.findById(idCompra)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada: " + idCompra));

        compra.setEstado(nuevoEstado);
        compraRepository.save(compra);

        List<DetalleCompra> detalles = detalleCompraRepository.findByIdCompra(idCompra);
        return new CompraResponse(compra, detalles);
    }
}