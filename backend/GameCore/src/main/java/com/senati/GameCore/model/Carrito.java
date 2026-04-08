package com.senati.GameCore.model;


import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name="carrito")
public class Carrito {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_carrito")
    private Integer idCarrito;

    @OneToMany(mappedBy = "carrito", fetch = FetchType.LAZY)
    private List<CarritoDetalle> detalles;


    @OneToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    //getter and setter

    public List<CarritoDetalle> getDetalles() { return detalles; }

    public Integer getIdCarrito() {return idCarrito;}
    public void setIdCarrito(Integer idCarrito) {this.idCarrito = idCarrito;}

    public Usuario getUsuario() {return usuario;}
    public void setUsuario(Usuario usuario) {this.usuario = usuario;}
}
