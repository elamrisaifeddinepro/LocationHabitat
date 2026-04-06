package ca.uqtr.locationhabitat.businessservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public JwtUserPrincipal extractUserPrincipal(String token) {
        Claims claims = extractClaims(token);

        String subject = claims.getSubject();

        String authUserId = firstNonBlank(
                getClaimAsString(claims, "userId"),
                getClaimAsString(claims, "authUserId"),
                getClaimAsString(claims, "id"),
                subject
        );

        String email = firstNonBlank(
                getClaimAsString(claims, "email"),
                subject
        );

        String role = firstNonBlank(
                getClaimAsString(claims, "role"),
                "USER"
        );

        return new JwtUserPrincipal(authUserId, email, role);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private String getClaimAsString(Claims claims, String claimName) {
        Object value = claims.get(claimName);
        return value == null ? null : value.toString();
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }

        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }

        return null;
    }
}