package com.senati.GameCore.dto;

import com.senati.GameCore.model.Carrito;
import com.senati.GameCore.model.CarritoDetalle;

import java.math.BigDecimal;
import java.util.List;

public class CarritoResponse {

    private Integer idCarrito;
    private Integer idUsuario;
    private List<CarritoDetalleResponse> detalles;
    private Integer cantidadItems;
    private BigDecimal total;

    public CarritoResponse(Carrito carrito, List<CarritoDetalle> detalles, BigDecimal total) {
        this.idCarrito = carrito.getIdCarrito();
        this.idUsuario = carrito.getUsuario() != null ? carrito.getUsuario().getIdUsuario() : null;
        this.detalles = detalles.stream().map(CarritoDetalleResponse::new).toList();
        this.cantidadItems = detalles.size();
        this.total = total;
    }

    public Integer getIdCarrito() { return idCarrito; }
    public Integer getIdUsuario() { return idUsuario; }
    public List<CarritoDetalleResponse> getDetalles() { return detalles; }
    public Integer getCantidadItems() { return cantidadItems; }
    public BigDecimal getTotal() { return total; }
}