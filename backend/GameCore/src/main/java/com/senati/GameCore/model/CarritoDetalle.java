package com.senati.GameCore.model;

import jakarta.persistence.*;

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

    @ManyToOne
    @JoinColumn(name="id_carrito", nullable = false)
    private Carritos carrito;

    @ManyToOne
    @JoinColumn(name="id_producto", nullable = false)
    private Productos producto;

    @Column(name="cantidad", nullable = false)
    private Integer cantidad;

    @Column(name="fecha_agregado", updatable = false)
    private LocalDateTime fechaAgregado;

    @PrePersist
    protected void onCreate() {
        this.fechaAgregado = LocalDateTime.now();
    }

    public Integer getIdDetalle() {return idDetalle;}
    public void setIdDetalle(Integer idDetalle) {this.idDetalle = idDetalle;}

    public Carritos getCarrito() {return carrito;}
    public void setCarrito(Carritos carrito) {this.carrito = carrito;}

    public Productos getProducto() {return producto;}
    public void setProducto(Productos producto) {this.producto = producto;}

    public Integer getCantidad() {return cantidad;}
    public void setCantidad(Integer cantidad) {this.cantidad = cantidad;}

    public LocalDateTime getFechaAgregado() {return fechaAgregado;}
    public void setFechaAgregado(LocalDateTime fechaAgregado) {this.fechaAgregado = fechaAgregado;}
}
