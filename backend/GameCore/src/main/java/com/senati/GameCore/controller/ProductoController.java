package com.senati.GameCore.controller;

import com.senati.GameCore.dto.ProductoRequest;
import com.senati.GameCore.dto.ProductoResponse;
import com.senati.GameCore.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // ─── CUALQUIER AUTENTICADO ────────────────────────────────────────────────

    // GET /productos
    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    // GET /productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    // GET /productos/buscar?nombre=mario
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoResponse>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    // GET /productos/categoria/{idCategoria}
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<ProductoResponse>> listarPorCategoria(@PathVariable Integer idCategoria) {
        return ResponseEntity.ok(productoService.listarPorCategoria(idCategoria));
    }

    // GET /productos/disponibles
    @GetMapping("/disponibles")
    public ResponseEntity<List<ProductoResponse>> listarDisponibles() {
        return ResponseEntity.ok(productoService.listarDisponibles());
    }

    // GET /productos/precio?min=10&max=100
    @GetMapping("/precio")
    public ResponseEntity<List<ProductoResponse>> listarPorRangoPrecio(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max) {
        return ResponseEntity.ok(productoService.listarPorRangoPrecio(min, max));
    }

    // GET /productos/ordenados
    @GetMapping("/ordenados")
    public ResponseEntity<List<ProductoResponse>> listarOrdenadosPorPrecio() {
        return ResponseEntity.ok(productoService.listarOrdenadosPorPrecio());
    }

    // GET /productos/paginado?page=0&size=10
    @GetMapping("/paginado")
    public ResponseEntity<List<ProductoResponse>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productoService.listarPaginado(page, size));
    }

    // ─── SOLO ADMIN ───────────────────────────────────────────────────────────

    // POST /productos/admin
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> crear(@RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.crear(request));
    }

    // PATCH /productos/admin/{id}
    @PatchMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> actualizar(
            @PathVariable Integer id,
            @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    // DELETE /productos/admin/{id}
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> eliminar(@PathVariable Integer id) {
        productoService.eliminar(id);
        return ResponseEntity.ok("Producto eliminado correctamente");
    }
}