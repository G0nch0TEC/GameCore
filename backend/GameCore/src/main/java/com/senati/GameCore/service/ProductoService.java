package com.senati.GameCore.service;

import com.senati.GameCore.dto.ProductoRequest;
import com.senati.GameCore.dto.ProductoResponse;
import com.senati.GameCore.model.Categoria;
import com.senati.GameCore.model.Producto;
import com.senati.GameCore.repository.CategoriaRepository;
import com.senati.GameCore.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // ─── CONSULTAS (cualquier autenticado) ────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarTodos() {
        return productoRepository.findAllProductos()
                .stream().map(ProductoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse buscarPorId(Integer id) {
        Producto producto = productoRepository.findByIdProducto(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
        return new ProductoResponse(producto);
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContaining(nombre)
                .stream().map(ProductoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoria(idCategoria)
                .stream().map(ProductoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarDisponibles() {
        return productoRepository.findDisponible()
                .stream().map(ProductoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarPorRangoPrecio(BigDecimal min, BigDecimal max) {
        return productoRepository.findByPrecioBetween(min, max)
                .stream().map(ProductoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarOrdenadosPorPrecio() {
        return productoRepository.findAllOrderByPrecioAsc()
                .stream().map(ProductoResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarPaginado(int page, int size) {
        return productoRepository.findAllPaginado(page, size)
                .stream().map(ProductoResponse::new).toList();
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + request.getIdCategoria()));

        Producto producto = new Producto();
        producto.setNombreProducto(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setImgUrl(request.getImgUrl());
        producto.setCategoria(categoria);
        // estado queda ACTIVO por default del modelo

        return new ProductoResponse(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Integer id, ProductoRequest request) {
        Producto producto = productoRepository.findByIdProducto(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            producto.setNombreProducto(request.getNombre());
        }
        if (request.getDescripcion() != null && !request.getDescripcion().isBlank()) {
            producto.setDescripcion(request.getDescripcion());
        }
        if (request.getPrecio() != null && request.getPrecio().compareTo(BigDecimal.ZERO) > 0) {
            producto.setPrecio(request.getPrecio());
        }
        if (request.getStock() != null && request.getStock() >= 0) {
            producto.setStock(request.getStock());
        }
        if (request.getImgUrl() != null && !request.getImgUrl().isBlank()) {
            producto.setImgUrl(request.getImgUrl());
        }
        if (request.getIdCategoria() != null) {
            Categoria categoria = categoriaRepository.findById(request.getIdCategoria())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + request.getIdCategoria()));
            producto.setCategoria(categoria);
        }

        return new ProductoResponse(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Integer id) {
        if (productoRepository.findByIdProducto(id).isEmpty()) {
            throw new RuntimeException("Producto no encontrado: " + id);
        }
        productoRepository.deleteById(id);
    }
}