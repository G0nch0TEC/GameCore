package com.senati.GameCore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

@Entity
@Table(name="detalle_compra", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_compra", "id_producto"})
})
public class DetalleCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_detalle")
    private Integer idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_compra", nullable = false)
    private Compra  compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_producto", nullable = false)
    private Producto producto;

    @Min(value = 1, message = "Debe ser mayor a 0")
    @Column(name="cantidad", nullable = false)
    private Integer cantidad;

    @DecimalMin(value = "0.01", message = "El precio unitario debe ser mayor a 0")
    @Column(name="precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    //getter and setter

    public Integer getIdDetalle() {return idDetalle;}
    public void setIdDetalle(Integer idDetalle) {this.idDetalle = idDetalle;}

    public Compra getCompra() {return compra;}
    public void setCompra(Compra compra) {this.compra = compra;}

    public Producto getProducto() {return producto;}
    public void setProducto(Producto producto) {this.producto = producto;}

    public Integer getCantidad() {return cantidad;}
    public void setCantidad(Integer cantidad) {this.cantidad = cantidad;}

    public BigDecimal getPrecioUnitario() {return precioUnitario;}
    public void setPrecioUnitario(BigDecimal precioUnitario) {this.precioUnitario = precioUnitario;}
}
