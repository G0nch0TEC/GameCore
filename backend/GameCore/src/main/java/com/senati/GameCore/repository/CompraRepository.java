package com.senati.GameCore.repository;


import com.senati.GameCore.model.Compra;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CompraRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Compra save(Compra compra) {
        if (compra.getIdCompra()==null ) {
            entityManager.persist(compra);
            return compra;
        } else {
            return entityManager.merge(compra);
        }
    }

    public Optional<Compra> findById(Integer idCompra) {
        return Optional.ofNullable(entityManager.find(Compra.class, idCompra));
    }

    public List<Compra> findAll() {
        return entityManager.createQuery("SELECT c FROM Compra c", Compra.class)
                .getResultList();
    }

    public void deleteById(Integer idCompra) {
        Compra compra = entityManager.find(Compra.class, idCompra);
        if (compra!=null) {
            entityManager.remove(compra);
        }
    }

    public List<Compra> findByEstado(Compra.Estado estado) {
        return entityManager.createQuery("SELECT c FROM Compra c WHERE c.estado = :estado", Compra.class)
                .setParameter("estado", estado )
                .getResultList();
    }

    public List<Compra> findByIdUsuario(Integer idUsuario) {
        return entityManager.createQuery("SELECT c FROM Compra c WHERE c.usuario.idUsuario = :idUsuario", Compra.class)
                .setParameter("idUsuario", idUsuario )
                .getResultList();
    }

    public List<Compra> findByIdUsuarioAndEstado(Integer idUsuario, Compra.Estado estado) {
        return entityManager.createQuery("SELECT c FROM Compra c WHERE c.usuario.idUsuario = :idUsuario AND c.estado = :estado", Compra.class)
                .setParameter("idUsuario", idUsuario)
                .setParameter("estado", estado)
                .getResultList();
    }
}
