package com.senati.GameCore.service;

import com.senati.GameCore.model.Usuario;
import com.senati.GameCore.repository.UsuarioRepository;
import com.senati.GameCore.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ─── MÉTODOS PARA CUALQUIER USUARIO AUTENTICADO ───────────────────────────

    // Ver su propio perfil — extrae el usuario del token JWT activo
    @Transactional(readOnly = true)
    public Usuario verPerfilPropio() {
        String correo = obtenerCorreoAutenticado();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Actualizar nombre y/o correo del propio perfil
    @Transactional
    public Usuario actualizarPerfilPropio(String nuevoNombre, String nuevoCorreo) {
        String correo = obtenerCorreoAutenticado();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (nuevoNombre != null && !nuevoNombre.isBlank()) {
            usuario.setNombre(nuevoNombre);
        }

        if (nuevoCorreo != null && !nuevoCorreo.isBlank() && !nuevoCorreo.equals(correo)) {
            if (usuarioRepository.existsByCorreo(nuevoCorreo)) {
                throw new RuntimeException("El correo ya está en uso");
            }
            usuario.setCorreo(nuevoCorreo);
        }

        return usuarioRepository.save(usuario);
    }

    // Cambiar contraseña — requiere la contraseña actual para verificar identidad
    @Transactional
    public void cambiarContrasena(String contrasenaActual, String contrasenaNueva) {
        String correo = obtenerCorreoAutenticado();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(contrasenaActual, usuario.getContrasena())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (contrasenaNueva == null || contrasenaNueva.isBlank() || contrasenaNueva.length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        usuario.setContrasena(passwordEncoder.encode(contrasenaNueva));
        usuarioRepository.save(usuario);
    }

    // ─── MÉTODOS SOLO PARA ADMIN ──────────────────────────────────────────────

    // Listar todos los usuarios
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // Listar por rol (ADMIN o CLIENTE)
    @Transactional(readOnly = true)
    public List<Usuario> listarPorRol(Usuario.Rol rol) {
        return usuarioRepository.findByRol(rol);
    }

    // Buscar usuario por ID
    @Transactional(readOnly = true)
    public Usuario buscarPorId(Integer idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + idUsuario));
    }

    // Cambiar rol de un usuario
    @Transactional
    public Usuario cambiarRol(Integer idUsuario, Usuario.Rol nuevoRol) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + idUsuario));

        usuario.setRol(nuevoRol);
        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario por ID
    @Transactional
    public void eliminarUsuario(Integer idUsuario) {
        if (usuarioRepository.findById(idUsuario).isEmpty()) {
            throw new RuntimeException("Usuario no encontrado con id: " + idUsuario);
        }
        usuarioRepository.deleteById(idUsuario);
    }

    // ─── UTILIDAD INTERNA ─────────────────────────────────────────────────────

    // Extrae el correo del usuario autenticado desde el SecurityContext
    private String obtenerCorreoAutenticado() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new RuntimeException("No hay usuario autenticado");
    }
}