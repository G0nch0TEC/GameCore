package com.senati.GameCore.repository;


import com.senati.GameCore.model.Carritos;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class CarritosRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Optional<Carritos> findByIdUsuario(Integer idUsuario) {
        return entityManager.createQuery("SELECT c FROM Carritos c WHERE c.usuario.idUsuario = :idUsuario", Carritos.class)
                .setParameter("idUsuario", idUsuario)
                .getResultStream()
                .findFirst();
    }

    public Optional<Carritos> findByIdCarrito(Integer idCarrito) {
        return Optional.ofNullable(entityManager.find(Carritos.class, idCarrito));
    }

    public Carritos save(Carritos carrito) {
        if (carrito.getIdCarrito() == null) {
            entityManager.persist(carrito);
            return carrito;
        } else {
            return entityManager.merge(carrito);
        }
    }

    public void  delete(Integer idCarrito) {
        Carritos c = entityManager.find(Carritos.class, idCarrito);
        if (c != null) {
            entityManager.remove(c);
        }
    }
}
