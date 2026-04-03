package com.senati.GameCore.repository;

import com.senati.GameCore.model.Productos;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductosRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Productos save(Productos producto) {
        if (producto.getIdProducto() == null) {
            entityManager.persist(producto);
            return producto;
        } else {
            return entityManager.merge(producto);
        }
    }

    public Optional<Productos> findByIdProducto(Integer idProducto) {
        Productos productos = entityManager.find(Productos.class, idProducto);
        return Optional.ofNullable(productos);
    }

    public List<Productos> findAllProductos() {
        return entityManager.createQuery("SELECT p FROM Productos p", Productos.class).getResultList();
    }

    public void deleteById(Integer idProducto) {
        Productos productos = entityManager.find(Productos.class, idProducto);
        if (productos != null) {
            entityManager.remove(productos);
        }
    }

    //Buscar por nombre (directo)
    public List<Productos> findByNombre(String nombre) {
        return entityManager.createQuery("SELECT p FROM Productos p WHERE LOWER(p.nombreProducto) = LOWER(:nombre)", Productos.class)
                .setParameter("nombre", nombre)
                .getResultList();
    }

    //buscar por nombre (flexible)
    public List<Productos> findByNombreContaining(String nombre) {
        return entityManager.createQuery("SELECT p FROM Productos p WHERE LOWER(p.nombreProducto) LIKE LOWER(:nombre)", Productos.class)
                .setParameter("nombre", "%" + nombre + "%")
                .getResultList();
    }

    public List<Productos> findByCategoria(Integer idCategoria) {
        return entityManager.createQuery("SELECT p FROM Productos p WHERE p.categoria.idCategoria = :idCategoria", Productos.class)
                .setParameter("idCategoria", idCategoria)
                .getResultList();
    }

    public List<Productos> findByPrecioBetween(Double min, Double max) {
        return entityManager.createQuery("SELECT p FROM Productos p WHERE p.precio BETWEEN :min and :max", Productos.class)
                .setParameter("min", min)
                .setParameter("max", max)
                .getResultList();
    }

    public List<Productos> findDisponible(){
        return entityManager.createQuery("SELECT p FROM Productos p WHERE p.stock > 0", Productos.class)
                .getResultList();
    }

    public List<Productos> findAllOrderByPrecioAsc(){
        return entityManager.createQuery("SELECT p FROM Productos p ORDER BY p.precio ASC", Productos.class)
                .getResultList();
    }

    public List<Productos> findAllPaginado(int page, int size){
        return  entityManager.createQuery("SELECT p FROM Productos p", Productos.class)
                .setFirstResult(page*size)
                .setMaxResults(size)
                .getResultList();
    }
}
