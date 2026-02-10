package com.project.cinecatch.domain.member.controller;

import com.project.cinecatch.domain.member.dto.FcmTokenRequest;
import com.project.cinecatch.domain.member.dto.LoginRequest;
import com.project.cinecatch.domain.member.dto.MemberRequest;
import com.project.cinecatch.domain.member.dto.TokenResponse;
import com.project.cinecatch.domain.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // 1. 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@Valid @RequestBody MemberRequest request) {
        memberService.signUp(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 2. 로그인 API (성공 시 JWT 토큰 반환)
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        // 서비스에서 로그인 로직 처리 후 토큰 생성
        TokenResponse token = memberService.login(request);
        return ResponseEntity.ok(token);
    }

    // 3. FCM 토큰 저장 API
    @PostMapping("/fcm-token")
    public ResponseEntity<String> updateFcmToken(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody FcmTokenRequest request
    ) {
        memberService.updateFcmToken(email, request.getFcmToken());
        return ResponseEntity.ok("FCM 토큰이 저장되었습니다.");
    }

    // 4. 알림 설정 조회
    @GetMapping("/notification-settings")
    public ResponseEntity<Map<String, Boolean>> getNotificationSettings(
            @AuthenticationPrincipal String email
    ) {
        boolean enabled = memberService.getNotificationEnabled(email);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    // 5. 알림 설정 변경
    @PutMapping("/notification-settings")
    public ResponseEntity<String> updateNotificationSettings(
            @AuthenticationPrincipal String email,
            @RequestBody Map<String, Boolean> request
    ) {
        Boolean enabled = request.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().body("enabled 필드는 필수입니다.");
        }
        memberService.updateNotificationEnabled(email, enabled);
        return ResponseEntity.ok("알림 설정이 변경되었습니다.");
    }
}