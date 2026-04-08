package com.senati.GameCore.repository;

import com.senati.GameCore.model.DetalleCompra;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class DetalleCompraRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public DetalleCompra save(DetalleCompra detalle) {
        if (detalle.getIdDetalle() == null) {
            entityManager.persist(detalle);
            return detalle;
        } else {
            return entityManager.merge(detalle);
        }
    }

    @Transactional(readOnly = true)
    public Optional<DetalleCompra> findById(Integer idDetalle) {
        return Optional.ofNullable(entityManager.find(DetalleCompra.class, idDetalle));
    }

    @Transactional
    public void deleteById(Integer idDetalle) {
        DetalleCompra detalle = entityManager.find(DetalleCompra.class, idDetalle);
        if (detalle != null) {
            entityManager.remove(detalle);
        }
    }

    @Transactional(readOnly = true)
    public List<DetalleCompra> findByIdCompra(Integer idCompra) {
        return entityManager.createQuery("SELECT d FROM DetalleCompra d WHERE d.compra.idCompra = :idCompra", DetalleCompra.class)
                .setParameter("idCompra", idCompra)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public Optional<DetalleCompra> findByIdCompraAndIdProducto(Integer idCompra, Integer idProducto) {
        return entityManager.createQuery("SELECT d FROM DetalleCompra d WHERE d.compra.idCompra = :idCompra AND d.producto.idProducto = :idProducto", DetalleCompra.class)
                .setParameter("idCompra", idCompra)
                .setParameter("idProducto", idProducto)
                .getResultStream().findFirst();
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotal(Integer idCompra) {
        BigDecimal result = entityManager.createQuery("SELECT SUM(d.cantidad * d.precioUnitario) FROM DetalleCompra d WHERE d.compra.idCompra = :idCompra", BigDecimal.class)
                .setParameter("idCompra", idCompra)
                .getSingleResult();
        return result != null ? result : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public Long countItems(Integer idCompra) {
        return entityManager.createQuery("SELECT COUNT(d) FROM DetalleCompra d WHERE d.compra.idCompra = :idCompra", Long.class)
                .setParameter("idCompra", idCompra)
                .getSingleResult();
    }
}