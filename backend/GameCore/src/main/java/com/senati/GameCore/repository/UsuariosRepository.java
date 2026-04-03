package com.senati.GameCore.repository;

import com.senati.GameCore.model.Usuarios;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UsuariosRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Usuarios save(Usuarios usuario) {
        if (usuario.getIdUsuario() == null) {
            entityManager.persist(usuario);
            return usuario;
        } else {
            return entityManager.merge(usuario);
        }
    }

    public Optional<Usuarios> findById(Integer idUsuario) {
        Usuarios usuario = entityManager.find(Usuarios.class, idUsuario);
        return Optional.ofNullable(usuario);
    }

    public List<Usuarios> findAll() {
        return entityManager.createQuery("SELECT u FROM Usuarios u", Usuarios.class).getResultList();
    }

    public void deleteById(Integer idUsuario) {
        Usuarios usuario = entityManager.find(Usuarios.class, idUsuario);
        if (usuario != null) {
            entityManager.remove(usuario);
        }
    }

    public Optional<Usuarios> findByCorreo(String correo) {
        return entityManager.createQuery(
          "SELECT u FROM Usuarios u WHERE u.correo = :correo", Usuarios.class)
                .setParameter("correo", correo).getResultStream().findFirst();
    }

    public boolean existsByCorreo(String correo) {
        Long count = entityManager.createQuery("SELECT COUNT(u) FROM Usuarios u WHERE u.correo = :correo", Long.class)
                .setParameter("correo", correo)
                .getSingleResult();
        return count > 0;
    }

    public List<Usuarios> findByRol(Usuarios.Rol rol) {
        return entityManager.createQuery("SELECT u FROM Usuarios u WHERE u.rol = :rol", Usuarios.class)
                .setParameter("rol", rol)
                .getResultList();
    }
}
