package com.senati.GameCore.repository;


import com.senati.GameCore.model.CarritoDetalle;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CarritoDetalleRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<CarritoDetalle> findByIdCarrito(Integer idCarrito) {
        return entityManager.createQuery("SELECT d FROM CarritoDetalle d WHERE d.carrito.idCarrito = :idCarrito", CarritoDetalle.class)
                .setParameter("idCarrito", idCarrito)
                .getResultList();
    }

    public Optional<CarritoDetalle> findByIdCarritoAndIdProducto(Integer idCarrito, Integer idProducto) {
        return entityManager.createQuery("SELECT d FROM CarritoDetalle d WHERE d.carrito.idCarrito = :idCarrito AND d.producto.idProducto = :idProducto", CarritoDetalle.class)
                .setParameter("idCarrito", idCarrito)
                .setParameter("idProducto", idProducto)
                .getResultStream().findFirst();

    }

    public CarritoDetalle save(CarritoDetalle carritoDetalle) {
        if (carritoDetalle.getIdDetalle() == null) {
            entityManager.persist(carritoDetalle);
            return carritoDetalle;
        } else {
            return entityManager.merge(carritoDetalle);
        }
    }

    public void deleteByIdDetalle(Integer IdDetalle) {
        CarritoDetalle d = entityManager.find(CarritoDetalle.class, IdDetalle);
        if (d != null) {
            entityManager.remove(d);
        }
    }

    public void clearByIdCarrito(Integer idCarrito) {
        entityManager.createQuery("DELETE FROM CarritoDetalle d WHERE d.carrito.idCarrito = :idCarrito", CarritoDetalle.class)
                .setParameter("idCarrito", idCarrito)
                .executeUpdate();
    }

    public void updateCantidad(Integer idDetalle, Integer cantidad) {
        entityManager.createQuery("UPDATE CarritoDetalle d SET d.cantidad = :cantidad WHERE d.idDetalle = :idDetalle")
                .setParameter("cantidad", cantidad)
                .setParameter("idDetalle", idDetalle)
                .executeUpdate();
    }

    public Double calcularTotal(Integer idCarrito) {
        return entityManager.createQuery("SELECT SUM(d.cantidad * d.producto.precio)" + "FROM CarritoDetalle d WHERE d.carrito.idCarrito = :idCarrito", Double.class)
                .setParameter("idCarrito", idCarrito)
                .getSingleResult();
    }

    public Long countItems(Integer idCarrito) {
        return entityManager.createQuery("SELECT COUNT(d) FROM CarritoDetalle d WHERE d.carrito.idCarrito = :idCarrito", Long.class)
                .setParameter("idCarrito", idCarrito)
                .getSingleResult();
    }

    public List<CarritoDetalle> findByIdCarritoOrderByFecha(Integer idCarrito) {
        return entityManager.createQuery("SELECT d FROM CarritoDetalle d" + " WHERE d.carrito.idCarrito = :idCarrito" + " ORDER BY d.fechaAgregado DESC", CarritoDetalle.class)
                .setParameter("idCarrito", idCarrito)
                .getResultList();
    }
}
