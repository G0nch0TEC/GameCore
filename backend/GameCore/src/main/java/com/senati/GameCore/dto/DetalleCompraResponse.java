package com.senati.GameCore.dto;

import com.senati.GameCore.model.DetalleCompra;
import java.math.BigDecimal;

public class DetalleCompraResponse {

    private Integer idDetalle;
    private Integer idProducto;
    private String  nombreProducto;
    private String  imgUrl;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;

    public DetalleCompraResponse(DetalleCompra detalle) {
        this.idDetalle      = detalle.getIdDetalle();
        this.cantidad       = detalle.getCantidad();
        this.precioUnitario = detalle.getPrecioUnitario();
        this.subtotal       = detalle.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(detalle.getCantidad()));

        if (detalle.getProducto() != null) {
            this.idProducto      = detalle.getProducto().getIdProducto();
            this.nombreProducto  = detalle.getProducto().getNombreProducto();
            this.imgUrl          = detalle.getProducto().getImgUrl();
        }
    }

    public Integer    getIdDetalle()      { return idDetalle; }
    public Integer    getIdProducto()     { return idProducto; }
    public String     getNombreProducto() { return nombreProducto; }
    public String     getImgUrl()         { return imgUrl; }
    public Integer    getCantidad()       { return cantidad; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public BigDecimal getSubtotal()       { return subtotal; }
}