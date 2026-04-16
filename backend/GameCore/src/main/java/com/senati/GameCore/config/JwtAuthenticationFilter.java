package com.senati.GameCore.config;

import com.senati.GameCore.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    // Constructor — inyectamos las dependencias
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Leer el header "Authorization" de la petición
        String authHeader = request.getHeader("Authorization");

        // 2. Verificar que el header existe y empieza con "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer solo el token, quitando el "Bearer " del inicio
        String token = authHeader.substring(7);

        // 4. Validar que el token sea correcto y no haya expirado
        if (!jwtUtil.validateToken(token)) {
            // ← Antes dejaba pasar, ahora responde 401 correctamente
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token inválido o expirado");
            return;
        }

        // 5. Extraer el correo guardado dentro del token
        String correo = jwtUtil.extractCorreo(token);

        // 6. Verificar que aún no haya una autenticación activa en esta petición
        if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 7. Buscar el usuario completo en la base de datos
            UserDetails userDetails = userDetailsService.loadUserByUsername(correo);

            // 8. Crear el objeto de autenticación que Spring Security entiende
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,        // quién es el usuario
                            null,               // credenciales (null porque ya validamos el token)
                            userDetails.getAuthorities() // sus roles (admin, cliente)
                    );

            // 9. Agregar detalles de la petición al objeto de autenticación
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 10. Registrar la autenticación en el contexto de Spring Security
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // 11. Dejar continuar la petición hacia el controller
        filterChain.doFilter(request, response);
    }
}