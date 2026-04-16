package com.senati.GameCore.controller;

import com.senati.GameCore.dto.CompraResponse;
import com.senati.GameCore.model.Compra;
import com.senati.GameCore.security.CustomUserDetails;
import com.senati.GameCore.service.CompraService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/compras")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    // ─── CLIENTE ──────────────────────────────────────────────────────────────

    // POST /compras  →  confirmar carrito como compra
    @PostMapping
    public ResponseEntity<CompraResponse> realizarCompra(Authentication auth) {
        return ResponseEntity.ok(compraService.realizarCompra(getIdUsuario(auth)));
    }

    // GET /compras  →  historial de mis compras
    @GetMapping
    public ResponseEntity<List<CompraResponse>> misCompras(Authentication auth) {
        return ResponseEntity.ok(compraService.misCompras(getIdUsuario(auth)));
    }

    // GET /compras/{id}  →  ver detalle de una compra propia
    @GetMapping("/{id}")
    public ResponseEntity<CompraResponse> verCompra(
            Authentication auth,
            @PathVariable Integer id) {
        return ResponseEntity.ok(compraService.verCompra(getIdUsuario(auth), id));
    }

    // PATCH /compras/{id}/pagar  →  pagar si está PENDIENTE
    @PatchMapping("/{id}/pagar")
    public ResponseEntity<CompraResponse> pagarCompra(
            Authentication auth,
            @PathVariable Integer id) {
        return ResponseEntity.ok(compraService.pagarCompra(getIdUsuario(auth), id));
    }

    // PATCH /compras/{id}/cancelar  →  cancelar si está PENDIENTE
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<CompraResponse> cancelarCompra(
            Authentication auth,
            @PathVariable Integer id) {
        return ResponseEntity.ok(compraService.cancelarCompra(getIdUsuario(auth), id));
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    // GET /compras/admin/todas
    @GetMapping("/admin/todas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CompraResponse>> listarTodas() {
        return ResponseEntity.ok(compraService.listarTodas());
    }

    // GET /compras/admin/{id}  →  ver detalle de cualquier compra (solo ADMIN)
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompraResponse> verCompraAdmin(@PathVariable Integer id) {
        return ResponseEntity.ok(compraService.verCompraAdmin(id));
    }

    // GET /compras/admin/estado?estado=PENDIENTE
    @GetMapping("/admin/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CompraResponse>> listarPorEstado(
            @RequestParam Compra.Estado estado) {
        return ResponseEntity.ok(compraService.listarPorEstado(estado));
    }

    // PATCH /compras/admin/{id}/estado  →  cambiar estado manualmente
    @PatchMapping("/admin/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompraResponse> cambiarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String estadoStr = body.get("estado");
        if (estadoStr == null || estadoStr.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Compra.Estado nuevoEstado = Compra.Estado.valueOf(estadoStr.toUpperCase());
            return ResponseEntity.ok(compraService.cambiarEstado(id, nuevoEstado));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + estadoStr + ". Valores válidos: PENDIENTE, PAGADO, CANCELADO");
        }
    }

    // ─── HELPER ───────────────────────────────────────────────────────────────
    private Integer getIdUsuario(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userDetails.getIdUsuario();
    }
}