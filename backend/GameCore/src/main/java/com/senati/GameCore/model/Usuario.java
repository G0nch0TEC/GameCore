package com.senati.GameCore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_usuario")
    private Integer idUsuario;

    @Column(name="nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name="correo", nullable = false, unique = true, length = 150)
    private String correo;

    @Column(name="contrasena", nullable = false, length = 255)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol",  columnDefinition = "ENUM('ADMIN', 'CLIENTE')")
    private Rol rol = Rol.CLIENTE;

    @Column(name="fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
    }

    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private Carrito carrito;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Producto> productos;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Compra> compras;

    public enum Rol { ADMIN, CLIENTE }

    // obtener y insertar

    @JsonIgnore
    public Carrito getCarrito() { return carrito; }

    @JsonIgnore
    public List<Producto> getProductos() { return productos; }

    @JsonIgnore
    public List<Compra> getCompras() { return compras; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) {this.contrasena = contrasena;}

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
}

