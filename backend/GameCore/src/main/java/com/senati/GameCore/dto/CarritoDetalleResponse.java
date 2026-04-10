package com.senati.GameCore.dto;

import com.senati.GameCore.model.CarritoDetalle;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CarritoDetalleResponse {

    private Integer idDetalle;
    private Integer idProducto;
    private String nombreProducto;
    private String imgUrl;
    private BigDecimal precioUnitario;
    private Integer cantidad;
    private BigDecimal subtotal;
    private LocalDateTime fechaAgregado;

    public CarritoDetalleResponse(CarritoDetalle detalle) {
        this.idDetalle = detalle.getIdDetalle();
        this.cantidad = detalle.getCantidad();
        this.fechaAgregado = detalle.getFechaAgregado();

        // Datos del producto asociado
        if (detalle.getProducto() != null) {
            this.idProducto = detalle.getProducto().getIdProducto();
            this.nombreProducto = detalle.getProducto().getNombreProducto();
            this.imgUrl = detalle.getProducto().getImgUrl();
            this.precioUnitario = detalle.getProducto().getPrecio();
            // subtotal = precio actual × cantidad
            this.subtotal = detalle.getProducto().getPrecio()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));
        }
    }

    public Integer getIdDetalle() { return idDetalle; }
    public Integer getIdProducto() { return idProducto; }
    public String getNombreProducto() { return nombreProducto; }
    public String getImgUrl() { return imgUrl; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public Integer getCantidad() { return cantidad; }
    public BigDecimal getSubtotal() { return subtotal; }
    public LocalDateTime getFechaAgregado() { return fechaAgregado; }
}