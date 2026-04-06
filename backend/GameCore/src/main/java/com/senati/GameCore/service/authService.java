package com.senati.GameCore.service;

import com.senati.GameCore.config.JwtUtil;
import com.senati.GameCore.dto.LoginRequest;
import com.senati.GameCore.dto.RegisterRequest;
import com.senati.GameCore.dto.authResponse;
import com.senati.GameCore.model.Usuario;
import com.senati.GameCore.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class authService {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthenticationManager authenticationManager;

    public authService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public authResponse register(RegisterRequest registerRequest){
        if (usuarioRepository.existsByCorreo(registerRequest.getCorreo())){
            throw new RuntimeException("Correo ya existe");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(registerRequest.getNombre());
        usuario.setCorreo(registerRequest.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(registerRequest.getContrasena()));

        usuarioRepository.save(usuario);

        String token = jwtUtil.generateToken(usuario.getCorreo());

        return new authResponse(token);
    }

    public authResponse login(LoginRequest loginRequest) {
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
        return new authResponse(token);
    }
}
