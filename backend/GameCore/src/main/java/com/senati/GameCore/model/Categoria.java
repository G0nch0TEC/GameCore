package com.senati.GameCore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="categoria")
public class Categoria {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_categoria")
    private Integer idCategoria;

    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    private List<Producto> productos;

    @Column(name="nombre", length = 100, nullable = false, unique = true)
    private String nombre;

    @Column(name="descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name="fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }

    //Mete y saca

    @JsonIgnore
    public List<Producto> getProductos() { return productos; }

    public Integer getIdCategoria() {return idCategoria;}
    public void setIdCategoria(Integer idCategoria) {this.idCategoria = idCategoria;}

    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}

    public String getDescripcion() {return descripcion;}
    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}

    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
}
