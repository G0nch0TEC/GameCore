package com.senati.GameCore.config;


import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = "clave-secreta-gamecore-2026-segura";

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10;

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    //MÉTODO 1 — Genera un token nuevo a partir del email del usuario
    public String generateToken(String correo) {
        return Jwts.builder()
                .setSubject(correo)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.ES256)
                .compact();
    }

    // MÉTODO 2 — Lee el email que está guardado dentro del token
    public String extractCorreo(String token) {
        return Jwts.parser()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // MÉTODO 3 — Verifica si el token es válido y no ha expirado
    public Boolean validateToken(String token) {
          try {
              Jwts.parser()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token);
              return true;
          } catch (JwtException e){
              return false;
          }
    }
}
