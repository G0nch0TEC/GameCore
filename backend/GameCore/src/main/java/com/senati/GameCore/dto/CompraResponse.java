package com.senati.GameCore.dto;

import com.senati.GameCore.model.Compra;
import com.senati.GameCore.model.DetalleCompra;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CompraResponse {

    private Integer       idCompra;
    private Integer       idUsuario;
    private String        estado;
    private BigDecimal    total;
    private LocalDateTime fechaCompra;
    private Integer       cantidadItems;
    private List<DetalleCompraResponse> detalles;

    public CompraResponse(Compra compra, List<DetalleCompra> detalles) {
        this.idCompra      = compra.getIdCompra();
        this.idUsuario     = compra.getUsuario() != null ? compra.getUsuario().getIdUsuario() : null;
        this.estado        = compra.getEstado().name();
        this.total         = compra.getTotal();
        this.fechaCompra   = compra.getFechaCompra();
        this.detalles      = detalles.stream().map(DetalleCompraResponse::new).toList();
        this.cantidadItems = detalles.size();
    }

    public Integer       getIdCompra()      { return idCompra; }
    public Integer       getIdUsuario()     { return idUsuario; }
    public String        getEstado()        { return estado; }
    public BigDecimal    getTotal()         { return total; }
    public LocalDateTime getFechaCompra()   { return fechaCompra; }
    public Integer       getCantidadItems() { return cantidadItems; }
    public List<DetalleCompraResponse> getDetalles() { return detalles; }
}