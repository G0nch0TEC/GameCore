package com.senati.GameCore.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="categoria")
public class Categoria {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_categoria")
    private Integer idCategoria;

    @Column(name="nombre", length = 100, nullable = false, unique = true)
    private String nombre;

    @Column(name="descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name="fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @PrePersist
    protected void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Integer getIdCategoria() {return idCategoria;}
    public void setIdCategoria(Integer idCategoria) {this.idCategoria = idCategoria;}

    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}

    public String getDescripcion() {return descripcion;}
    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}

    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}
}
