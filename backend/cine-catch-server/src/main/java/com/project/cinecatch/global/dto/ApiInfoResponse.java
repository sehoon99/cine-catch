package com.project.cinecatch.global.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiInfoResponse {
    private String projectName;
    private String version;
    private String description;
    private String status;

    @Builder.Default
    private List<ApiEndpoint> endpoints = List.of(
            new ApiEndpoint("GET", "/", "API 기본 정보"),
            new ApiEndpoint("GET", "/health", "서버 상태 확인"),
            new ApiEndpoint("GET", "/api/theaters", "전체 영화관 조회"),
            new ApiEndpoint("GET", "/api/theaters/nearby", "근처 영화관 검색"),
            new ApiEndpoint("GET", "/api/theaters/{id}", "영화관 상세 정보"),
            new ApiEndpoint("GET", "/api/events", "이벤트 조회"),
            new ApiEndpoint("GET", "/api/events/nearby", "근처 이벤트 검색"),
            new ApiEndpoint("GET", "/api/events/{id}", "이벤트 상세 정보"),
            new ApiEndpoint("GET", "/swagger-ui.html", "API 문서")
    );

    @Getter
    @AllArgsConstructor
    public static class ApiEndpoint {
        private String method;
        private String path;
        private String description;
    }
}