package com.project.cinecatch.domain.member.controller;

import com.project.cinecatch.domain.member.service.EventFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorite", description = "이벤트 찜 API")
public class EventFavoriteController {

    private final EventFavoriteService eventFavoriteService;

    @GetMapping("/event-ids")
    @Operation(summary = "찜한 이벤트 ID 목록 조회")
    public ResponseEntity<Set<String>> getFavoriteEventIds(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(eventFavoriteService.getFavoriteEventIds(email));
    }

    @PostMapping("/{eventId}")
    @Operation(summary = "이벤트 찜 추가")
    public ResponseEntity<Void> addFavorite(
            @AuthenticationPrincipal String email,
            @PathVariable String eventId) {
        eventFavoriteService.addFavorite(email, eventId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{eventId}")
    @Operation(summary = "이벤트 찜 해제")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal String email,
            @PathVariable String eventId) {
        eventFavoriteService.removeFavorite(email, eventId);
        return ResponseEntity.noContent().build();
    }
}
