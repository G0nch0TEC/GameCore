package com.senati.GameCore.model;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
public class Productos {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_producto")
    private Integer idProducto;

    @ManyToOne
    @JoinColumn(name="id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name="id_usuario", nullable = true)
    private Usuarios usuario;

    @Column(name="nombre_producto", nullable = false)
    private String nombreProducto;

    @Column(name="descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name="precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name="stock", nullable = false)
    private Integer stock;

    @Column(name="img_url", columnDefinition = "TEXT")
    private String imgUrl;

    @Column(name="estado", columnDefinition = "VARCHAR(20) DEFAULT 'activo'")
    private String estado;

    @Column(name="fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion =  LocalDateTime.now();

    @Column(name="fecha_actualizacion")
    private LocalDateTime fechaActualizacion =  LocalDateTime.now();

    public Integer getIdProducto() {return idProducto;}
    public void setIdProducto(Integer idProducto) {this.idProducto = idProducto;}

    public Categoria getCategoria() {return categoria;}
    public void setCategoria(Categoria categoria) {this.categoria = categoria;}

    public Usuarios getUsuario() {return usuario;}
    public void setUsuario(Usuarios usuario) {this.usuario = usuario;}

    public String getNombreProducto() {return nombreProducto;}
    public void setNombreProducto(String nombreProducto) {this.nombreProducto = nombreProducto;}

    public String getDescripcion() {return descripcion;}
    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}

    public BigDecimal getPrecio() {return precio;}
    public void setPrecio(BigDecimal precio) {this.precio = precio;}

    public Integer getStock() {return stock;}
    public void setStock(Integer stock) {this.stock = stock;}

    public String getImgUrl() {return imgUrl;}
    public void setImgUrl(String imgUrl) {this.imgUrl = imgUrl;}

    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}

    public LocalDateTime getFechaCreacion() {return fechaCreacion;}
    public void setFechaCreacion(LocalDateTime fechaCreacion) {this.fechaCreacion = fechaCreacion;}

    public LocalDateTime getFechaActualizacion() {return fechaActualizacion;}
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {this.fechaActualizacion = fechaActualizacion;}
}
