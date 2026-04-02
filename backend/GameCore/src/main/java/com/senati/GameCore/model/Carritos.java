package com.senati.GameCore.model;


import jakarta.persistence.*;
import jakarta.persistence.Table;

@Entity
@Table(name="carritos")
public class Carritos {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_carrito")
    private Integer idCarrito;

    @OneToOne
    @JoinColumn(name="id_usuario", nullable = false, unique = true)
    private Usuarios usuario;

    public Integer getIdCarrito() {return idCarrito;}
    public void setIdCarrito(Integer idCarrito) {this.idCarrito = idCarrito;}

    public Usuarios getUsuario() {return usuario;}
    public void setUsuario(Usuarios usuario) {this.usuario = usuario;}
}
