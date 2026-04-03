package com.senati.GameCore.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="compras")
public class Compras {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Integer idCompra;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="id_usuario", nullable = false)
    private Usuarios usuario;

    @Column(name="fecha_compra", updatable = false)
    private LocalDateTime fechaCompra;

    @PrePersist
    protected void onCreate() {
        this.fechaCompra = LocalDateTime.now();
    }

    public enum Estado { Pendiente, Pagado, cancelado }
    @Enumerated(EnumType.STRING)
    @Column(name="estado", nullable = false)
    private Estado estado;

    @Column(name="total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    public Integer getIdCompra() {return idCompra;}
    public void setIdCompra(Integer idCompra) {this.idCompra = idCompra;}

    public Usuarios getUsuario() {return usuario;}
    public void setUsuario(Usuarios usuario) {this.usuario = usuario;}

    public LocalDateTime getFechaCompra() {return fechaCompra;}
    public void setFechaCompra(LocalDateTime fechaCompra) {this.fechaCompra = fechaCompra;}

    public Estado getEstado() {return estado;}
    public void setEstado(Estado estado) {this.estado = estado;}

    public BigDecimal getTotal() {return total;}
    public void setTotal(BigDecimal total) {this.total = total;}
}
