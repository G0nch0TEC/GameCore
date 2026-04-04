package com.senati.GameCore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="compras")
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Integer idCompra;

    @OneToMany(mappedBy = "compra", fetch = FetchType.LAZY)
    private List<DetalleCompra> detalles;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name="fecha_compra", updatable = false)
    private LocalDateTime fechaCompra;

    @PrePersist
    protected void onCreate() {
        this.fechaCompra = LocalDateTime.now();
    }

    public enum Estado { pendiente, pagado, cancelado }
    @Enumerated(EnumType.STRING)
    @Column(name="estado", columnDefinition = "ENUM('pendiente', 'pagado', 'cancelado')", nullable = false)
    private Estado estado;

    @DecimalMin(value = "0.0", message = "El total no puede ser negativo")
    @Column(name="total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    //getter and setter

    public List<DetalleCompra> getDetalles() { return detalles; }

    public Integer getIdCompra() {return idCompra;}
    public void setIdCompra(Integer idCompra) {this.idCompra = idCompra;}

    public Usuario getUsuario() {return usuario;}
    public void setUsuario(Usuario usuario) {this.usuario = usuario;}

    public LocalDateTime getFechaCompra() {return fechaCompra;}

    public Estado getEstado() {return estado;}
    public void setEstado(Estado estado) {this.estado = estado;}

    public BigDecimal getTotal() {return total;}
    public void setTotal(BigDecimal total) {this.total = total;}
}
