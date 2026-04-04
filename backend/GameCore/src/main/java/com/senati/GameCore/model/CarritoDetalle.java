package com.senati.GameCore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
@Table(name="carrito_detalle", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_carrito", "id_producto"})
})
public class CarritoDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_detalle")
    private Integer idDetalle;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name="id_carrito", nullable = false)
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_producto", nullable = false)
    private Producto producto;

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Column(name="cantidad", nullable = false)
    private Integer cantidad;

    @Column(name="fecha_agregado", updatable = false)
    private LocalDateTime fechaAgregado;

    @PrePersist
    protected void onCreate() {
        this.fechaAgregado = LocalDateTime.now();
    }

    //getter and setter

    public Integer getIdDetalle() {return idDetalle;}
    public void setIdDetalle(Integer idDetalle) {this.idDetalle = idDetalle;}

    public Carrito getCarrito() {return carrito;}
    public void setCarrito(Carrito carrito) {this.carrito = carrito;}

    public Producto getProducto() {return producto;}
    public void setProducto(Producto producto) {this.producto = producto;}

    public Integer getCantidad() {return cantidad;}
    public void setCantidad(Integer cantidad) {this.cantidad = cantidad;}

    public LocalDateTime getFechaAgregado() {return fechaAgregado;}
}
