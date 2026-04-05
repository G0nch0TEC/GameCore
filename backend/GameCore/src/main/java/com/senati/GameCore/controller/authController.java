package com.senati.GameCore.controller;

import com.senati.GameCore.config.JwtUtil;
import com.senati.GameCore.dto.LoginRequest;
import com.senati.GameCore.dto.RegisterRequest;
import com.senati.GameCore.dto.authResponse;
import com.senati.GameCore.model.Usuario;
import com.senati.GameCore.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auth")
public class authController {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthenticationManager authenticationManager;

    public authController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<authResponse> register(@RequestBody RegisterRequest registerRequest){

         if (usuarioRepository.existsByCorreo(registerRequest.getCorreo())){
             return ResponseEntity.badRequest().build();
         }

         Usuario usuario = new Usuario();
         usuario.setNombre(registerRequest.getNombre());
         usuario.setCorreo(registerRequest.getCorreo());
         usuario.setContrasena(passwordEncoder.encode(registerRequest.getContrasena()));

         usuarioRepository.save(usuario);

         String token = jwtUtil.generateToken(usuario.getCorreo());

         return ResponseEntity.ok(new authResponse(token));
    }

    @PostMapping("/Login")
    public ResponseEntity<authResponse> login(@RequestBody LoginRequest loginRequest){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getCorreo(),
                            loginRequest.getContrasena())
            );
        }catch (AuthenticationException e){
            return ResponseEntity.status(401).build();
        }

        String token = jwtUtil.generateToken(loginRequest.getCorreo());
        return ResponseEntity.ok(new authResponse(token));
    }
}
