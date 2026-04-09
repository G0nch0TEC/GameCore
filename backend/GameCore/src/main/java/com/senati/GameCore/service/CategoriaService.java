package com.senati.GameCore.service;

import com.senati.GameCore.model.Categoria;
import com.senati.GameCore.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    // Listar todas las categorías (público o autenticado)
    @Transactional(readOnly = true)
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + id));
    }

    // Crear nueva categoría (solo ADMIN)
    @Transactional
    public Categoria crear(String nombre, String descripcion) {
        if (categoriaRepository.existsByNombre(nombre)) {
            throw new RuntimeException("Ya existe una categoría con el nombre: " + nombre);
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setDescripcion(descripcion);
        return categoriaRepository.save(categoria);
    }

    // Actualizar nombre y/o descripción (solo ADMIN)
    @Transactional
    public Categoria actualizar(Integer id, String nuevoNombre, String nuevaDescripcion) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + id));

        if (nuevoNombre != null && !nuevoNombre.isBlank()) {
            if (!nuevoNombre.equalsIgnoreCase(categoria.getNombre())
                    && categoriaRepository.existsByNombre(nuevoNombre)) {
                throw new RuntimeException("Ya existe una categoría con el nombre: " + nuevoNombre);
            }
            categoria.setNombre(nuevoNombre);
        }

        if (nuevaDescripcion != null && !nuevaDescripcion.isBlank()) {
            categoria.setDescripcion(nuevaDescripcion);
        }

        return categoriaRepository.save(categoria);
    }

    // Eliminar por ID (solo ADMIN)
    @Transactional
    public void eliminar(Integer id) {
        if (categoriaRepository.findById(id).isEmpty()) {
            throw new RuntimeException("Categoría no encontrada con id: " + id);
        }
        categoriaRepository.deleteById(id);
    }
}