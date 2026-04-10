package com.senati.GameCore.service;

import com.senati.GameCore.dto.CarritoResponse;
import com.senati.GameCore.model.Carrito;
import com.senati.GameCore.model.CarritoDetalle;
import com.senati.GameCore.model.Producto;
import com.senati.GameCore.repository.CarritoDetalleRepository;
import com.senati.GameCore.repository.CarritoRepository;
import com.senati.GameCore.repository.ProductoRepository;
import com.senati.GameCore.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoDetalleRepository carritoDetalleRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public CarritoService(CarritoRepository carritoRepository,
                          CarritoDetalleRepository carritoDetalleRepository,
                          ProductoRepository productoRepository,
                          UsuarioRepository usuarioRepository) {
        this.carritoRepository = carritoRepository;
        this.carritoDetalleRepository = carritoDetalleRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ─── VER CARRITO ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CarritoResponse obtenerCarrito(Integer idUsuario) {
        Carrito carrito = obtenerOCrearCarrito(idUsuario);
        return buildResponse(carrito);
    }

    // ─── AGREGAR PRODUCTO ─────────────────────────────────────────────────────

    @Transactional
    public CarritoResponse agregarProducto(Integer idUsuario, Integer idProducto, Integer cantidad) {
        Carrito carrito = obtenerOCrearCarrito(idUsuario);

        Producto producto = productoRepository.findByIdProducto(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + idProducto));

        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente para: " + producto.getNombreProducto());
        }

        // Si el producto ya está en el carrito, suma la cantidad
        carritoDetalleRepository
                .findByIdCarritoAndIdProducto(carrito.getIdCarrito(), idProducto)
                .ifPresentOrElse(
                        detalle -> {
                            int nuevaCantidad = detalle.getCantidad() + cantidad;
                            if (producto.getStock() < nuevaCantidad) {
                                throw new RuntimeException("Stock insuficiente para: " + producto.getNombreProducto());
                            }
                            carritoDetalleRepository.updateCantidad(detalle.getIdDetalle(), nuevaCantidad);
                        },
                        () -> {
                            CarritoDetalle nuevo = new CarritoDetalle();
                            nuevo.setCarrito(carrito);
                            nuevo.setProducto(producto);
                            nuevo.setCantidad(cantidad);
                            carritoDetalleRepository.save(nuevo);
                        }
                );

        return buildResponse(carrito);
    }

    // ─── ACTUALIZAR CANTIDAD ──────────────────────────────────────────────────

    @Transactional
    public CarritoResponse actualizarCantidad(Integer idUsuario, Integer idDetalle, Integer cantidad) {

        CarritoDetalle detalle = carritoDetalleRepository
                .findByIdDetalleAndIdUsuario(idDetalle, idUsuario)
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado o no pertenece al usuario"));

        if (detalle.getProducto().getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        // ✔ Mejor que update manual
        detalle.setCantidad(cantidad);
        carritoDetalleRepository.save(detalle);

        return buildResponse(detalle.getCarrito());
    }

    // ─── ELIMINAR ÍTEM ────────────────────────────────────────────────────────

    @Transactional
    public CarritoResponse eliminarItem(Integer idUsuario, Integer idDetalle) {
        Carrito carrito = carritoRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado para usuario: " + idUsuario));

        // Validar que el detalle pertenece a este carrito
        boolean pertenece = carritoDetalleRepository.findByIdCarrito(carrito.getIdCarrito())
                .stream().anyMatch(d -> d.getIdDetalle().equals(idDetalle));

        if (!pertenece) throw new RuntimeException("El ítem no pertenece a tu carrito");

        carritoDetalleRepository.deleteByIdDetalle(idDetalle);
        return buildResponse(carrito);
    }

    // ─── VACIAR CARRITO ───────────────────────────────────────────────────────

    @Transactional
    public void vaciarCarrito(Integer idUsuario) {
        Carrito carrito = carritoRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado para usuario: " + idUsuario));
        carritoDetalleRepository.clearByIdCarrito(carrito.getIdCarrito());
    }

    // ─── HELPERS PRIVADOS ─────────────────────────────────────────────────────

    // Si el usuario no tiene carrito todavía, lo crea automáticamente
    private Carrito obtenerOCrearCarrito(Integer idUsuario) {
        return carritoRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException(
                        "Carrito no encontrado para usuario: " + idUsuario));
    }

    private CarritoResponse buildResponse(Carrito carrito) {
        List<CarritoDetalle> detalles = carritoDetalleRepository
                .findByIdCarritoOrderByFecha(carrito.getIdCarrito());
        BigDecimal total = carritoDetalleRepository.calcularTotal(carrito.getIdCarrito());
        return new CarritoResponse(carrito, detalles, total);
    }
}