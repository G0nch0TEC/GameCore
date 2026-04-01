package com.senati.GameCore.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="usuarios")
public class Usuarios {
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
    @Column(name = "rol", columnDefinition = "ENUM('admin', 'cliente') DEFAULT 'cliente'")
    private Rol rol = Rol.cliente;

    @Column(name="fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro =  LocalDateTime.now();

    public enum Rol { admin, cliente }

    // obtener y insertar
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
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}

