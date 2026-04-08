package com.senati.GameCore.repository;

import com.senati.GameCore.model.Categoria;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoriaRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Categoria save(Categoria categoria) {
        if (categoria.getIdCategoria() == null) {
            entityManager.persist(categoria);
            return categoria;
        } else {
            return entityManager.merge(categoria);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> findById(Integer idCategoria) {
        Categoria categoria = entityManager.find(Categoria.class, idCategoria);
        return Optional.ofNullable(categoria);
    }

    @Transactional(readOnly = true)
    public List<Categoria> findAll() {
        return entityManager.createQuery("SELECT c FROM Categoria c", Categoria.class).getResultList();
    }

    @Transactional
    public void deleteById(Integer idCategoria) {
        Categoria categoria = entityManager.find(Categoria.class, idCategoria);
        if (categoria != null) {
            entityManager.remove(categoria);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> findByNombre(String nombre) {
        return entityManager.createQuery("SELECT c FROM Categoria c WHERE LOWER(c.nombre) = LOWER(:nombre)", Categoria.class)
                .setParameter("nombre", nombre)
                .getResultStream()
                .findFirst();
    }

    @Transactional(readOnly = true)
    public boolean existsByNombre(String nombre) {
        Long count = entityManager.createQuery("SELECT COUNT(c) FROM Categoria c WHERE  LOWER(c.nombre) = LOWER(:nombre)", Long.class)
                .setParameter("nombre", nombre)
                .getSingleResult();
        return count > 0;
    }
}
