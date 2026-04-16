package com.senati.GameCore.config;


import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getKey() {
        byte[] KeyBytes = secret.getBytes();
        if (KeyBytes.length < 32) {
            throw new RuntimeException("jwt.secret debe tener al menos 32 caracteres (256 bits)");
        }
        return Keys.hmacShaKeyFor(KeyBytes);
    }

    public String extractRol(String token) {
        return (String) Jwts.parser()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("rol");
    }

    //MÉTODO 1 — Genera un token nuevo a partir del email del usuario
    public String generateToken(String correo, String rol) {
        return Jwts.builder()
                .setSubject(correo)
                .addClaims(Map.of("rol", rol))   // ← guarda el rol en el token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey(), SignatureAlgorithm.HS256)
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
