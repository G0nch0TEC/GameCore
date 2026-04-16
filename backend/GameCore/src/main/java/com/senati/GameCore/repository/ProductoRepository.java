package com.senati.GameCore.repository;

import com.senati.GameCore.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductoRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Producto save(Producto producto) {
        if (producto.getIdProducto() == null) {
            entityManager.persist(producto);
            return producto;
        } else {
            return entityManager.merge(producto);
        }
    }

    @Transactional(readOnly = true)
    public Optional<Producto> findByIdProducto(Integer idProducto) {
        Producto productos = entityManager.find(Producto.class, idProducto);
        return Optional.ofNullable(productos);
    }

    @Transactional(readOnly = true)
    public List<Producto> findAllProductos() {
        return entityManager.createQuery("SELECT p FROM Producto p", Producto.class).getResultList();
    }

    @Transactional
    public void deleteById(Integer idProducto) {
        Producto productos = entityManager.find(Producto.class, idProducto);
        if (productos != null) {
            entityManager.remove(productos);
        }
    }

    @Transactional(readOnly = true)
    //Buscar por nombre (directo)
    public List<Producto> findByNombre(String nombre) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE LOWER(p.nombreProducto) = LOWER(:nombre)", Producto.class)
                .setParameter("nombre", nombre)
                .getResultList();
    }

    @Transactional(readOnly = true)
    //buscar por nombre (flexible)
    public List<Producto> findByNombreContaining(String nombre) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE LOWER(p.nombreProducto) LIKE LOWER(:nombre)", Producto.class)
                .setParameter("nombre", "%" + nombre + "%")
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Producto> findByCategoria(Integer idCategoria) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE p.categoria.idCategoria = :idCategoria", Producto.class)
                .setParameter("idCategoria", idCategoria)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Producto> findByPrecioBetween(BigDecimal min, BigDecimal max) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE p.precio BETWEEN :min and :max", Producto.class)
                .setParameter("min", min)
                .setParameter("max", max)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Producto> findDisponible(){
        return entityManager.createQuery("SELECT p FROM Producto p WHERE p.stock > 0", Producto.class)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Producto> findAllOrderByPrecioAsc(){
        return entityManager.createQuery("SELECT p FROM Producto p ORDER BY p.precio ASC", Producto.class)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Producto> findAllPaginado(int page, int size){
        return  entityManager.createQuery("SELECT p FROM Producto p", Producto.class)
                .setFirstResult(page*size)
                .setMaxResults(size)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public List<Producto> findByUsuario(Integer idUsuario) {
        return entityManager.createQuery(
                        "SELECT p FROM Producto p WHERE p.usuario.idUsuario = :idUsuario", Producto.class)
                .setParameter("idUsuario", idUsuario)
                .getResultList();
    }
}
