package com.taskflow.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

// ─── @Slf4j ───────────────────────────────────────────────────────
// Lombok generates a logger: log.info(), log.error(), log.debug()
// We use it to log JWT events for debugging

// ─── @Service ─────────────────────────────────────────────────────
// Marks this as a Spring service bean
// Spring creates one instance and injects it wherever needed

@Slf4j
@Service
public class JwtService {

    // ─── @Value("${app.jwt.secret}") ──────────────────────────────
    // Reads the value from application.yaml
    // app.jwt.secret → the secret key we set in our config
    // This is how Spring injects configuration values into fields

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiry-minutes}")
    private long jwtExpiryMinutes;

    // ─── generateToken ────────────────────────────────────────────
    // Creates a new JWT access token for a user
    // Parameters:
    //   userId = the user's UUID (what we store in the token)
    //   extraClaims = additional data to embed in the token

    public String generateToken(String userId, Map<String, Object> extraClaims) {
        long expiryMs = jwtExpiryMinutes * 60 * 1000; // Convert minutes to milliseconds

        return Jwts.builder()
                .claims(extraClaims)           // Add extra data (email, etc.)
                .subject(userId)               // "sub" claim = who this token belongs to
                .issuedAt(new Date())          // "iat" = when token was created
                .expiration(new Date(System.currentTimeMillis() + expiryMs)) // "exp" = when it expires
                .signWith(getSigningKey())     // Sign with our secret key
                .compact();                    // Build the token string
    }

    public String generateToken(String userId) {
        return generateToken(userId, new HashMap<>());
    }

    // ─── validateToken ────────────────────────────────────────────
    // Returns true if the token is valid (correct signature + not expired)

    public boolean validateToken(String token) {
        try {
            // parseSignedClaims attempts to verify the signature
            // If signature is wrong or token is expired, it throws an exception
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Log the specific error for debugging (don't expose to user)
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    // ─── extractUserId ────────────────────────────────────────────
    // Reads the "sub" (subject) claim from the token
    // This gives us the userId without hitting the database

    public String extractUserId(String token) {
        return extractClaims(token).getSubject();
    }

    // ─── extractClaims ────────────────────────────────────────────
    // Parses the JWT and returns all claims (the payload data)
    // Private because only this class needs it

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ─── getSigningKey ────────────────────────────────────────────
    // Converts our secret string into a cryptographic key
    // HMAC-SHA256 requires a key of at least 256 bits (32 bytes)
    // Our JWT_SECRET in .env is 64 hex characters = 256 bits ✓

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}