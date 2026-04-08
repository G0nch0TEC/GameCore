package com.senati.GameCore.controller;


import com.senati.GameCore.model.Usuario;
import com.senati.GameCore.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // RUTAS PARA CUALQUIER USUARIO AUTENTICADO

    // VER PERFIL PROPIO (GET /usuarios/perfil)
    @GetMapping("/perfil")
    public ResponseEntity<Usuario> verPerfil() {
        return ResponseEntity.ok(usuarioService.verPerfilPropio());
    }

    //Actualizar nombre y/o correo (PATCH /usuarios/perfil)
    @PatchMapping("/perfil")
    public ResponseEntity<Usuario> actualizarPerfil(@RequestBody Map<String, String> body) {
        String nuevoNombre = body.get("nombre");
        String nuevoCorreo = body.get("correo");
        return  ResponseEntity.ok(usuarioService.actualizarPerfilPropio(nuevoNombre, nuevoCorreo));
    }

    //Cambiar contraseña propia (PATCH /usuarios/contrasena)
    @PatchMapping("/contrasena")
    public ResponseEntity<String> actualizarContrasena(@RequestBody Map<String, String> body) {
        String contrasenaActual = body.get("contrasenaActual");
        String contrasenaNueva =  body.get("contrasenaNueva");
        usuarioService.cambiarContrasena(contrasenaActual, contrasenaNueva);
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }

    //RUTAS SOLO PARA ADMINS
    // Listar todos los usuarios
    // GET /usuarios/admin/todos
    @GetMapping("/admin/todos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // Listar por rol
    // GET /usuarios/admin/rol?rol=CLIENTE
    @GetMapping("/admin/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> listarPorRol(@RequestParam Usuario.Rol rol) {
        return ResponseEntity.ok(usuarioService.listarPorRol(rol));
    }

    // Buscar usuario por ID
    // GET /usuarios/admin/{id}
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    // Cambiar rol de un usuario
    // PATCH /usuarios/admin/{id}/rol
    @PatchMapping("/admin/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Usuario> cambiarRol(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        Usuario.Rol nuevoRol = Usuario.Rol.valueOf(body.get("rol").toUpperCase());
        return ResponseEntity.ok(usuarioService.cambiarRol(id, nuevoRol));
    }

    // Eliminar usuario
    // DELETE /usuarios/admin/{id}
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Integer id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok("Usuario eliminado correctamente");
    }
}
