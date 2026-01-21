package com.project.cinecatch.global.service;

import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.entity.TheaterSubscription;
import com.project.cinecatch.domain.member.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventNotificationService {

    private final SubscriptionRepository subscriptionRepository;
    private final PushNotificationService pushNotificationService;

    /**
     * 특정 극장의 구독자들에게 새 이벤트 알림 발송
     *
     * @param theaterId   극장 ID
     * @param theaterName 극장 이름
     * @param eventTitle  이벤트 제목
     * @return 발송 성공 건수
     */
    public int notifySubscribers(String theaterId, String theaterName, String eventTitle) {
        // 해당 극장을 구독한 사용자들의 FCM 토큰 조회
        List<TheaterSubscription> subscriptions = subscriptionRepository.findByTheaterId(theaterId);

        List<String> fcmTokens = subscriptions.stream()
                .map(TheaterSubscription::getMember)
                .map(Member::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());

        if (fcmTokens.isEmpty()) {
            log.info("극장 {}의 구독자 중 FCM 토큰이 있는 사용자가 없습니다.", theaterName);
            return 0;
        }

        log.info("극장 {} 구독자 {}명에게 알림 발송 시작", theaterName, fcmTokens.size());
        return pushNotificationService.sendEventUpdateNotification(fcmTokens, theaterName, eventTitle);
    }

    /**
     * 특정 극장의 구독자들에게 이벤트 상태 변경 알림 발송
     *
     * @param theaterId   극장 ID
     * @param theaterName 극장 이름
     * @param eventTitle  이벤트 제목
     * @param newStatus   새로운 상태 (보유/신청/마감 등)
     * @return 발송 성공 건수
     */
    public int notifyStatusChange(String theaterId, String theaterName, String eventTitle, String newStatus) {
        List<TheaterSubscription> subscriptions = subscriptionRepository.findByTheaterId(theaterId);

        List<String> fcmTokens = subscriptions.stream()
                .map(TheaterSubscription::getMember)
                .map(Member::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());

        if (fcmTokens.isEmpty()) {
            return 0;
        }

        log.info("극장 {} 구독자 {}명에게 상태 변경 알림 발송", theaterName, fcmTokens.size());
        return pushNotificationService.sendStockUpdateNotification(fcmTokens, theaterName, eventTitle, newStatus);
    }
}
