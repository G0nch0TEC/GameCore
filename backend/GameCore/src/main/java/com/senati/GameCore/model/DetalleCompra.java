package com.senati.GameCore.model;

import jakarta.persistence.*;
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

    @ManyToOne
    @JoinColumn(name="id_compra", nullable = false)
    private Compras  idCompra;

    @ManyToOne
    @JoinColumn(name="id_producto", nullable = false)
    private Productos idProducto;

    @Column(name="cantidad", nullable = false)
    private Integer cantidad;

    @Column(name="precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    public Integer getIdDetalle() {return idDetalle;}
    public void setIdDetalle(Integer idDetalle) {this.idDetalle = idDetalle;}

    public Compras getIdCompra() {return idCompra;}
    public void setIdCompra(Compras idCompra) {this.idCompra = idCompra;}

    public Productos getIdProducto() {return idProducto;}
    public void setIdProducto(Productos idProducto) {this.idProducto = idProducto;}

    public Integer getCantidad() {return cantidad;}
    public void setCantidad(Integer cantidad) {this.cantidad = cantidad;}

    public BigDecimal getPrecioUnitario() {return precioUnitario;}
    public void setPrecioUnitario(BigDecimal precioUnitario) {this.precioUnitario = precioUnitario;}
}
