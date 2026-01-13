package com.project.cinecatch.global.controller;

import com.project.cinecatch.global.dto.ApiInfoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<ApiInfoResponse> getApiInfo() {
        ApiInfoResponse response = ApiInfoResponse.builder()
                .projectName("Cine-Catch")
                .version("0.0.1-SNAPSHOT")
                .description("영화관 이벤트 및 프로모션 알림 서비스")
                .status("running")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }
}