package com.sanchit.smart_attendance.security;

import com.sanchit.smart_attendance.security.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private static final String SECRET =
            "super-secret-key-super-secret-key-super-secret-key";

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(Long id, Role role, String email,  String deviceIdHash) {
        JwtBuilder builder = Jwts.builder()
                .setSubject(String.valueOf(id))
                .claim("role", role.name())
                .claim("email", email)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)
                );

        // 🔐 Bind device ONLY for students
        if (role == Role.USER) {
            builder.claim("device", deviceIdHash);
        }

        return builder
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractDeviceHash(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("device", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long extractId(String token) {
        return Long.parseLong(
                Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody()
                        .getSubject()
        );
    }

    public Role extractRole(String token) {
        return Role.valueOf(
                Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody()
                        .get("role", String.class)
        );
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("email", String.class);
    }

    private String extractToken(HttpServletRequest request) {

        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if ("access_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

}

