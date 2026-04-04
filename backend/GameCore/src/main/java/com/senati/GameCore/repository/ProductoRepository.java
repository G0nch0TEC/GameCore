package com.senati.GameCore.repository;

import com.senati.GameCore.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductoRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Producto save(Producto producto) {
        if (producto.getIdProducto() == null) {
            entityManager.persist(producto);
            return producto;
        } else {
            return entityManager.merge(producto);
        }
    }

    public Optional<Producto> findByIdProducto(Integer idProducto) {
        Producto productos = entityManager.find(Producto.class, idProducto);
        return Optional.ofNullable(productos);
    }

    public List<Producto> findAllProductos() {
        return entityManager.createQuery("SELECT p FROM Producto p", Producto.class).getResultList();
    }

    public void deleteById(Integer idProducto) {
        Producto productos = entityManager.find(Producto.class, idProducto);
        if (productos != null) {
            entityManager.remove(productos);
        }
    }

    //Buscar por nombre (directo)
    public List<Producto> findByNombre(String nombre) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE LOWER(p.nombreProducto) = LOWER(:nombre)", Producto.class)
                .setParameter("nombre", nombre)
                .getResultList();
    }

    //buscar por nombre (flexible)
    public List<Producto> findByNombreContaining(String nombre) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE LOWER(p.nombreProducto) LIKE LOWER(:nombre)", Producto.class)
                .setParameter("nombre", "%" + nombre + "%")
                .getResultList();
    }

    public List<Producto> findByCategoria(Integer idCategoria) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE p.categoria.idCategoria = :idCategoria", Producto.class)
                .setParameter("idCategoria", idCategoria)
                .getResultList();
    }

    public List<Producto> findByPrecioBetween(Double min, Double max) {
        return entityManager.createQuery("SELECT p FROM Producto p WHERE p.precio BETWEEN :min and :max", Producto.class)
                .setParameter("min", min)
                .setParameter("max", max)
                .getResultList();
    }

    public List<Producto> findDisponible(){
        return entityManager.createQuery("SELECT p FROM Producto p WHERE p.stock > 0", Producto.class)
                .getResultList();
    }

    public List<Producto> findAllOrderByPrecioAsc(){
        return entityManager.createQuery("SELECT p FROM Producto p ORDER BY p.precio ASC", Producto.class)
                .getResultList();
    }

    public List<Producto> findAllPaginado(int page, int size){
        return  entityManager.createQuery("SELECT p FROM Producto p", Producto.class)
                .setFirstResult(page*size)
                .setMaxResults(size)
                .getResultList();
    }
}
