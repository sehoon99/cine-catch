package com.project.cinecatch.global.security;

import com.project.cinecatch.domain.member.dto.TokenResponse;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // 1. 보안을 위해 아주 긴 비밀키가 필요함~함 (application.properties에 설정 추천)
    @Value("${jwt.secret:vmfhaltmskdlstkfkdgodyroqkfwkdbalroqkfwkdbal}")
    private String secretKey;

    private final long tokenValidityInMilliseconds = 1000L * 60 * 60 * 24; // 우선 24시간으로 설정함~함
    private Key key;

    @PostConstruct
    protected void init() {
        // 비밀키를 Base64로 인코딩해서 객체화함~함
        byte[] keyBytes = Base64.getEncoder().encode(secretKey.getBytes());
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // 2. 토큰 생성 (아까 MemberService에서 호출한 메서드임~함!)
    public TokenResponse createToken(String email, String role) {
        Claims claims = Jwts.claims().setSubject(email);
        claims.put("role", role); // Enum에서 변환된 "USER" 문자열이 여기 저장됨~함

        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);

        String accessToken = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        return TokenResponse.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .accessTokenExpiresIn(validity.getTime())
                .build();
    }

    // 3. 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}