package com.senati.GameCore.dto;

import java.math.BigDecimal;

public class ProductoRequest {

    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private String imgUrl;
    private Integer idCategoria;
    private String estado;

    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public BigDecimal getPrecio() { return precio; }
    public Integer getStock() { return stock; }
    public String getImgUrl() { return imgUrl; }
    public Integer getIdCategoria() { return idCategoria; }
    public String getEstado() { return estado; }
}