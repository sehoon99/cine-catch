package com.project.cinecatch.domain.member.controller;

import com.project.cinecatch.domain.member.dto.SubscriptionRequest;
import com.project.cinecatch.domain.member.dto.SubscriptionResponse;
import com.project.cinecatch.domain.member.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscription", description = "영화관 구독(찜) API")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    @Operation(summary = "내 구독 목록 조회", description = "로그인한 사용자의 구독 영화관 목록을 조회합니다")
    public ResponseEntity<List<SubscriptionResponse>> getMySubscriptions(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(subscriptionService.getMySubscriptions(email));
    }

    @GetMapping("/theater-ids")
    @Operation(summary = "구독한 영화관 ID 목록 조회", description = "로그인한 사용자가 구독한 영화관의 ID 목록을 조회합니다")
    public ResponseEntity<Set<String>> getSubscribedTheaterIds(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(subscriptionService.getSubscribedTheaterIds(email));
    }

    @PostMapping
    @Operation(summary = "영화관 구독", description = "영화관을 구독합니다")
    public ResponseEntity<SubscriptionResponse> subscribe(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(subscriptionService.subscribe(email, request));
    }

    @DeleteMapping("/{theaterId}")
    @Operation(summary = "영화관 구독 해제", description = "영화관 구독을 해제합니다")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal String email,
            @PathVariable String theaterId) {
        subscriptionService.unsubscribe(email, theaterId);
        return ResponseEntity.noContent().build();
    }
}
