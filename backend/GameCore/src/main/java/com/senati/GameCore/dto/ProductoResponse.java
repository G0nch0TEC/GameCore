package com.senati.GameCore.dto;

import com.senati.GameCore.model.Producto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductoResponse {

    private Integer idProducto;
    private Integer idCategoria;
    private Integer idUsuario;

    private String nombreProducto;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private String imgUrl;
    private String estado;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public ProductoResponse(Producto producto){
        this.idProducto = producto.getIdProducto();
        this.nombreProducto = producto.getNombreProducto();
        this.descripcion = producto.getDescripcion();
        this.precio = producto.getPrecio();
        this.stock = producto.getStock();
        this.imgUrl = producto.getImgUrl();
        this.estado= producto.getEstado()!= null ? producto.getEstado().name() : "ACTIVO";

        this.idCategoria = producto.getCategoria() != null ? producto.getCategoria().getIdCategoria() : null;
        this.idUsuario = producto.getUsuario() != null ? producto.getUsuario().getIdUsuario() : null;

        this.fechaCreacion = producto.getFechaCreacion();
        this.fechaActualizacion = producto.getFechaActualizacion();
    }

    public Integer getIdProducto(){return idProducto;}
    public Integer getIdCategoria(){return idCategoria;}
    public Integer getIdUsuario(){return idUsuario;}

    public String getNombreProducto(){return nombreProducto;}
    public String getDescripcion(){return descripcion;}
    public BigDecimal getPrecio(){return precio;}
    public Integer getStock(){return stock;}
    public String getImgUrl(){return imgUrl;}
    public String getEstado(){return estado;}

    public LocalDateTime getFechaCreacion(){return fechaCreacion;}
    public LocalDateTime getFechaActualizacion(){return fechaActualizacion;}
}
