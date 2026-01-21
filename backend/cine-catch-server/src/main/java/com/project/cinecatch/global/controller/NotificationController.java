package com.project.cinecatch.global.controller;

import com.project.cinecatch.global.service.EventNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/internal/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EventNotificationService eventNotificationService;

    /**
     * 새 이벤트 알림 발송 (크롤러에서 호출)
     */
    @PostMapping("/event-update")
    public ResponseEntity<Map<String, Object>> notifyEventUpdate(
            @RequestBody EventUpdateRequest request
    ) {
        log.info("이벤트 업데이트 알림 요청: 극장={}, 이벤트={}", request.theaterName(), request.eventTitle());

        int sentCount = eventNotificationService.notifySubscribers(
                request.theaterId(),
                request.theaterName(),
                request.eventTitle()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "sentCount", sentCount
        ));
    }

    /**
     * 이벤트 상태 변경 알림 발송 (크롤러에서 호출)
     */
    @PostMapping("/status-change")
    public ResponseEntity<Map<String, Object>> notifyStatusChange(
            @RequestBody StatusChangeRequest request
    ) {
        log.info("상태 변경 알림 요청: 극장={}, 이벤트={}, 새상태={}",
                request.theaterName(), request.eventTitle(), request.newStatus());

        int sentCount = eventNotificationService.notifyStatusChange(
                request.theaterId(),
                request.theaterName(),
                request.eventTitle(),
                request.newStatus()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "sentCount", sentCount
        ));
    }

    record EventUpdateRequest(
            String theaterId,
            String theaterName,
            String eventTitle
    ) {}

    record StatusChangeRequest(
            String theaterId,
            String theaterName,
            String eventTitle,
            String newStatus
    ) {}
}
