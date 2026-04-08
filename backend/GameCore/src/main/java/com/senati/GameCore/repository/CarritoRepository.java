package com.senati.GameCore.repository;


import com.senati.GameCore.model.Carrito;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public class CarritoRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public Optional<Carrito> findByIdUsuario(Integer idUsuario) {
        return entityManager.createQuery("SELECT c FROM Carrito c WHERE c.usuario.idUsuario = :idUsuario", Carrito.class)
                .setParameter("idUsuario", idUsuario)
                .getResultStream()
                .findFirst();
    }

    @Transactional(readOnly = true)
    public Optional<Carrito> findByIdCarrito(Integer idCarrito) {
        return Optional.ofNullable(entityManager.find(Carrito.class, idCarrito));
    }

    @Transactional
    public Carrito save(Carrito carrito) {
        if (carrito.getIdCarrito() == null) {
            entityManager.persist(carrito);
            return carrito;
        } else {
            return entityManager.merge(carrito);
        }
    }

    @Transactional
    public void  delete(Integer idCarrito) {
        Carrito c = entityManager.find(Carrito.class, idCarrito);
        if (c != null) {
            entityManager.remove(c);
        }
    }
}
