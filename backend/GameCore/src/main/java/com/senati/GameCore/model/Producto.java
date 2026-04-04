package com.senati.GameCore.model;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_producto")
    private Integer idProducto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_usuario")
    private Usuario usuario;

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

    public enum Estado { activo, inactivo, agotado}
    @Enumerated(EnumType.STRING)
    @Column(name="estado", columnDefinition = "ENUM('activo', 'inactivo', 'agotado')")
    private Estado estado = Estado.activo;

    @Column(name="fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name="fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public Integer getIdProducto() {return idProducto;}
    public void setIdProducto(Integer idProducto) {this.idProducto = idProducto;}

    public Categoria getCategoria() {return categoria;}
    public void setCategoria(Categoria categoria) {this.categoria = categoria;}

    public Usuario getUsuario() {return usuario;}
    public void setUsuario(Usuario usuario) {this.usuario = usuario;}

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

    public Estado getEstado() {return estado;}
    public void setEstado(Estado estado) {this.estado = estado;}

    public LocalDateTime getFechaCreacion() {return fechaCreacion;}

    public LocalDateTime getFechaActualizacion() {return fechaActualizacion;}
}
