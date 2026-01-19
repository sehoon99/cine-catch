package com.project.cinecatch.domain.member.controller;

import com.project.cinecatch.domain.member.dto.LoginRequest;
import com.project.cinecatch.domain.member.dto.MemberRequest;
import com.project.cinecatch.domain.member.dto.TokenResponse;
import com.project.cinecatch.domain.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}