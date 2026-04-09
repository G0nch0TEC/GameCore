package com.senati.GameCore.controller;

import com.senati.GameCore.model.Categoria;
import com.senati.GameCore.service.CategoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // GET /categorias — cualquier usuario autenticado
    @GetMapping
    public ResponseEntity<List<Categoria>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    // GET /categorias/{id} — cualquier usuario autenticado
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    // POST /categorias/admin — solo ADMIN
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categoria> crear(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(categoriaService.crear(body.get("nombre"), body.get("descripcion")));
    }

    // PATCH /categorias/admin/{id} — solo ADMIN
    @PatchMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categoria> actualizar(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String nuevoNombre = body.get("nombre");
        String nuevaDescripcion = body.get("descripcion");
        return ResponseEntity.ok(categoriaService.actualizar(id, nuevoNombre, nuevaDescripcion));
    }

    // DELETE /categorias/admin/{id} — solo ADMIN
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> eliminar(@PathVariable Integer id) {
        categoriaService.eliminar(id);
        return ResponseEntity.ok("Categoría eliminada correctamente");
    }
}
