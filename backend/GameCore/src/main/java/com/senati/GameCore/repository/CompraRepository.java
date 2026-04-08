package com.senati.GameCore.repository;


import com.senati.GameCore.model.Compra;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public class CompraRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Compra save(Compra compra) {
        if (compra.getIdCompra()==null ) {
            entityManager.persist(compra);
            return compra;
        } else {
            return entityManager.merge(compra);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Compra> findById(Integer idCompra) {
        return Optional.ofNullable(entityManager.find(Compra.class, idCompra));
    }

    @Transactional(readOnly = true)
    public List<Compra> findAll() {
        return entityManager.createQuery("SELECT c FROM Compra c", Compra.class)
                .getResultList();
    }

    @Transactional
    public void deleteById(Integer idCompra) {
        Compra compra = entityManager.find(Compra.class, idCompra);
        if (compra!=null) {
            entityManager.remove(compra);
        }
    }

    @Transactional(readOnly = true)
    public List<Compra> findByEstado(Compra.Estado estado) {
        return entityManager.createQuery("SELECT c FROM Compra c WHERE c.estado = :estado", Compra.class)
                .setParameter("estado", estado )
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Compra> findByIdUsuario(Integer idUsuario) {
        return entityManager.createQuery("SELECT c FROM Compra c WHERE c.usuario.idUsuario = :idUsuario", Compra.class)
                .setParameter("idUsuario", idUsuario )
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Compra> findByIdUsuarioAndEstado(Integer idUsuario, Compra.Estado estado) {
        return entityManager.createQuery("SELECT c FROM Compra c WHERE c.usuario.idUsuario = :idUsuario AND c.estado = :estado", Compra.class)
                .setParameter("idUsuario", idUsuario)
                .setParameter("estado", estado)
                .getResultList();
    }
}
