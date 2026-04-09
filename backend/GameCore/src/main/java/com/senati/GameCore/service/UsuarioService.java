package com.senati.GameCore.service;

import com.senati.GameCore.dto.UsuarioResponse;
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
    public UsuarioResponse verPerfilPropio() {
        String correo = obtenerCorreoAutenticado();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return new UsuarioResponse(usuario);
    }

    // Actualizar nombre y/o correo del propio perfil
    @Transactional
    public UsuarioResponse actualizarPerfilPropio(String nuevoNombre, String nuevoCorreo) {
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
        return new UsuarioResponse(usuarioRepository.save(usuario));
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
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponse::new)
                .toList();
    }

    // Listar por rol (ADMIN o CLIENTE)
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarPorRol(Usuario.Rol rol) {
        return usuarioRepository.findByRol(rol)
                .stream()
                .map(UsuarioResponse::new)
                .toList();
    }

    // Buscar usuario por ID
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + idUsuario));
        return new UsuarioResponse(usuario);
    }

    // Cambiar rol de un usuario
    @Transactional
    public UsuarioResponse cambiarRol(Integer idUsuario, Usuario.Rol nuevoRol) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + idUsuario));
        usuario.setRol(nuevoRol);
        return new UsuarioResponse(usuarioRepository.save(usuario));
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