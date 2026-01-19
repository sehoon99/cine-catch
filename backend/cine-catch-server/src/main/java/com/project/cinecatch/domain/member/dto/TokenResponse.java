package com.project.cinecatch.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TokenResponse {
    private String grantType;     // 보통 "Bearer"라고 보냄
    private String accessToken;   // 실제 권한을 주는 토큰
    private Long accessTokenExpiresIn; // 만료 시간
}