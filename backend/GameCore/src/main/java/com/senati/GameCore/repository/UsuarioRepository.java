package com.senati.GameCore.repository;

import com.senati.GameCore.model.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Usuario save(Usuario usuario) {
        if (usuario.getIdUsuario() == null) {
            entityManager.persist(usuario);
            return usuario;
        } else {
            return entityManager.merge(usuario);
        }
    }

    public Optional<Usuario> findById(Integer idUsuario) {
        Usuario usuario = entityManager.find(Usuario.class, idUsuario);
        return Optional.ofNullable(usuario);
    }

    public List<Usuario> findAll() {
        return entityManager.createQuery("SELECT u FROM Usuario u", Usuario.class).getResultList();
    }

    public void deleteById(Integer idUsuario) {
        Usuario usuario = entityManager.find(Usuario.class, idUsuario);
        if (usuario != null) {
            entityManager.remove(usuario);
        }
    }

    public Optional<Usuario> findByCorreo(String correo) {
        return entityManager.createQuery(
          "SELECT u FROM Usuario u WHERE u.correo = :correo", Usuario.class)
                .setParameter("correo", correo).getResultStream().findFirst();
    }

    public boolean existsByCorreo(String correo) {
        Long count = entityManager.createQuery("SELECT COUNT(u) FROM Usuario u WHERE u.correo = :correo", Long.class)
                .setParameter("correo", correo)
                .getSingleResult();
        return count > 0;
    }

    public List<Usuario> findByRol(Usuario.Rol rol) {
        return entityManager.createQuery("SELECT u FROM Usuario u WHERE u.rol = :rol", Usuario.class)
                .setParameter("rol", rol)
                .getResultList();
    }
}
