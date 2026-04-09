package com.senati.GameCore.service;

import com.senati.GameCore.model.Producto;
import com.senati.GameCore.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {this.productoRepository = productoRepository;}

    //Listar todos los productos
    @Transactional(readOnly = true)
    public List<Producto> listarTodos(){return productoRepository.findAllProductos();}

    //Buscar por ID
    @Transactional(readOnly = true)
    public Producto buscarPorId(Integer id){
        return productoRepository.findByIdProducto(id)
                .orElseThrow(()-> new RuntimeException("Producto no encontrado: " + id));
    }

    //Crear nuevo producto
     @Transactional
    public Producto crear(String nombre, String descripcion, BigDecimal precio, Integer stock) {
        Producto producto = new Producto();
        producto.setNombreProducto(nombre);
        producto.setDescripcion(descripcion);
        producto.setPrecio(precio);
        producto.setStock(stock);
        return productoRepository.save(producto);
     }

     @Transactional
    public Producto actualizar (Integer id, String newnombre, String newdescripcion, BigDecimal newprecio){
        Producto producto = productoRepository.findByIdProducto(id)
                .orElseThrow(()->new RuntimeException("Producto no encontrado: " + id));

        if (newnombre != null && !newnombre.isBlank()){
            producto.setNombreProducto(newnombre);
        }
        if (newdescripcion != null && !newdescripcion.isBlank()){
            producto.setDescripcion(newdescripcion);
        }
        if (newprecio != null && newprecio.compareTo(BigDecimal.ZERO) > 0) {
            producto.setPrecio(newprecio);
        }
        return productoRepository.save(producto);
     }

     @Transactional
    public void eliminar(Integer id){
        productoRepository.deleteById(id);
     }
}
