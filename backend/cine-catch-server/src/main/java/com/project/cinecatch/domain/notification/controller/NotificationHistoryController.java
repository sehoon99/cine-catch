package com.project.cinecatch.domain.notification.controller;

import com.project.cinecatch.domain.notification.entity.NotificationHistory;
import com.project.cinecatch.domain.notification.service.NotificationHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationHistoryController {

    private final NotificationHistoryService notificationHistoryService;

    @GetMapping
    public ResponseEntity<List<NotificationHistoryResponse>> getNotifications(
            @AuthenticationPrincipal String email
    ) {
        List<NotificationHistory> notifications = notificationHistoryService.getNotifications(email);
        List<NotificationHistoryResponse> response = notifications.stream()
                .map(NotificationHistoryResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(
            @AuthenticationPrincipal String email,
            @PathVariable UUID id
    ) {
        notificationHistoryService.markAsRead(email, id);
        return ResponseEntity.ok("읽음 처리되었습니다.");
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal String email
    ) {
        int count = notificationHistoryService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }

    record NotificationHistoryResponse(
            String id,
            String title,
            String body,
            boolean isRead,
            String createdAt
    ) {
        static NotificationHistoryResponse from(NotificationHistory notification) {
            return new NotificationHistoryResponse(
                    notification.getId().toString(),
                    notification.getTitle(),
                    notification.getBody(),
                    notification.isRead(),
                    notification.getCreatedAt().toString()
            );
        }
    }
}
