package com.senati.GameCore.service;

import com.senati.GameCore.config.JwtUtil;
import com.senati.GameCore.dto.LoginRequest;
import com.senati.GameCore.dto.RegisterRequest;
import com.senati.GameCore.dto.AuthResponse;
import com.senati.GameCore.model.Carrito;
import com.senati.GameCore.model.Usuario;
import com.senati.GameCore.repository.CarritoRepository;
import com.senati.GameCore.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private CarritoRepository carritoRepository;
    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthenticationManager authenticationManager;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       CarritoRepository carritoRepository) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.carritoRepository = carritoRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest){
        if (usuarioRepository.existsByCorreo(registerRequest.getCorreo())){
            throw new RuntimeException("Correo ya existe");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(registerRequest.getNombre());
        usuario.setCorreo(registerRequest.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(registerRequest.getContrasena()));

        usuarioRepository.saveAndFlush(usuario);

        Carrito carrito = new Carrito();
        carrito.setUsuario(usuario);
        carritoRepository.save(carrito);

        String token = jwtUtil.generateToken(usuario.getCorreo());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getCorreo(),
                            loginRequest.getContrasena())
            );
        }catch (AuthenticationException e){
            throw new BadCredentialsException("credenciales invalidas");
        }

        String token = jwtUtil.generateToken(loginRequest.getCorreo());
        return new AuthResponse(token);
    }
}
