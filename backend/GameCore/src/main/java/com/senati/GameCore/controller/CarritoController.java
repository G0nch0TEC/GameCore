package com.senati.GameCore.controller;

import com.senati.GameCore.dto.CarritoResponse;
import com.senati.GameCore.security.CustomUserDetails;
import com.senati.GameCore.service.CarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    // GET /carrito  →  ver mi carrito
    @GetMapping
    public ResponseEntity<CarritoResponse> verCarrito(Authentication auth) {
        Integer idUsuario = getIdUsuario(auth);
        return ResponseEntity.ok(carritoService.obtenerCarrito(idUsuario));
    }

    // POST /carrito/items?idProducto=3&cantidad=2  →  agregar producto
    @PostMapping("/items")
    public ResponseEntity<CarritoResponse> agregarProducto(
            Authentication auth,
            @RequestParam Integer idProducto,
            @RequestParam(defaultValue = "1") Integer cantidad) {
        Integer idUsuario = getIdUsuario(auth);
        return ResponseEntity.ok(carritoService.agregarProducto(idUsuario, idProducto, cantidad));
    }

    // PATCH /carrito/items/{idDetalle}?cantidad=5  →  cambiar cantidad
    @PatchMapping("/items/{idDetalle}")
    public ResponseEntity<CarritoResponse> actualizarCantidad(
            Authentication auth,
            @PathVariable Integer idDetalle,
            @RequestParam Integer cantidad) {
        Integer idUsuario = getIdUsuario(auth);
        return ResponseEntity.ok(carritoService.actualizarCantidad(idUsuario, idDetalle, cantidad));
    }

    // DELETE /carrito/items/{idDetalle}  →  quitar un ítem
    @DeleteMapping("/items/{idDetalle}")
    public ResponseEntity<CarritoResponse> eliminarItem(
            Authentication auth,
            @PathVariable Integer idDetalle) {
        Integer idUsuario = getIdUsuario(auth);
        return ResponseEntity.ok(carritoService.eliminarItem(idUsuario, idDetalle));
    }

    // DELETE /carrito  →  vaciar todo el carrito
    @DeleteMapping
    public ResponseEntity<String> vaciarCarrito(Authentication auth) {
        Integer idUsuario = getIdUsuario(auth);
        carritoService.vaciarCarrito(idUsuario);
        return ResponseEntity.ok("Carrito vaciado correctamente");
    }

    // ─── HELPER ──────────────────────────────────────────────────────────────
    private Integer getIdUsuario(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userDetails.getIdUsuario();
    }
}