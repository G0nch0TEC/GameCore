package com.senati.GameCore.repository;


import com.senati.GameCore.model.Compras;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ComprasRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Compras save(Compras compra) {
        if (compra.getIdCompra()==null ) {
            entityManager.persist(compra);
            return compra;
        } else {
            return entityManager.merge(compra);
        }
    }

    public Optional<Compras> findById(Integer idCompra) {
        return Optional.ofNullable(entityManager.find(Compras.class, idCompra));
    }

    public List<Compras> findAll() {
        return entityManager.createQuery("SELECT c FROM Compras c", Compras.class)
                .getResultList();
    }

    public void deleteById(Integer idCompra) {
        Compras compra = entityManager.find(Compras.class, idCompra);
        if (compra!=null) {
            entityManager.remove(compra);
        }
    }

    public List<Compras> findByEstado(Compras.Estado estado) {
        return entityManager.createQuery("SELECT c FROM Compras c WHERE c.estado = :estado", Compras.class)
                .setParameter("estado", estado )
                .getResultList();
    }

    public List<Compras> findByIdUsuario(Integer idUsuario) {
        return entityManager.createQuery("SELECT c FROM Compras c WHERE c.usuario.idUsuario = :idUsuario", Compras.class)
                .setParameter("idUsuario", idUsuario )
                .getResultList();
    }

    public List<Compras> findByIdUsuarioAndEstado(Integer idUsuario, Compras.Estado estado) {
        return entityManager.createQuery("SELECT c FROM Compras c WHERE c.usuario.idUsuario = :idUsuario AND c.estado = :estado", Compras.class)
                .setParameter("idUsuario", idUsuario)
                .setParameter("estado", estado)
                .getResultList();
    }
}
