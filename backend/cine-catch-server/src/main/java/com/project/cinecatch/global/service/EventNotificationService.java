package com.project.cinecatch.global.service;

import com.project.cinecatch.domain.member.entity.EventSubscription;
import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.entity.TheaterSubscription;
import com.project.cinecatch.domain.member.repository.EventFavoriteRepository;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import com.project.cinecatch.domain.member.repository.SubscriptionRepository;
import com.project.cinecatch.domain.notification.entity.NotificationHistory;
import com.project.cinecatch.domain.notification.repository.NotificationHistoryRepository;
import jakarta.transaction.Transactional;
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
    private final EventFavoriteRepository eventFavoriteRepository;
    private final MemberRepository memberRepository;
    private final PushNotificationService pushNotificationService;
    private final NotificationHistoryRepository notificationHistoryRepository;

    /**
     * 특정 극장의 구독자들에게 새 이벤트 알림 발송
     */
    @Transactional
    public int notifySubscribers(String theaterId, String theaterName, String eventTitle) {
        List<TheaterSubscription> subscriptions = subscriptionRepository.findByTheaterId(theaterId);

        List<Member> eligibleMembers = subscriptions.stream()
                .map(TheaterSubscription::getMember)
                .filter(Member::isNotificationEnabled)
                .collect(Collectors.toList());

        List<String> fcmTokens = eligibleMembers.stream()
                .map(Member::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());

        if (fcmTokens.isEmpty()) {
            log.info("극장 {}의 구독자 중 알림 가능한 사용자가 없습니다.", theaterName);
            return 0;
        }

        log.info("극장 {} 구독자 {}명에게 알림 발송 시작", theaterName, fcmTokens.size());
        PushNotificationService.SendResult result =
                pushNotificationService.sendEventUpdateNotification(fcmTokens, theaterName, eventTitle);

        // 알림 히스토리 저장
        String title = "새 이벤트 알림";
        String body = String.format("%s에서 새 이벤트가 시작되었습니다: %s", theaterName, eventTitle);
        saveNotificationHistory(eligibleMembers, title, body);

        // 무효 토큰 정리
        cleanupInvalidTokens(result.invalidTokens());

        return result.successCount();
    }

    /**
     * 특정 극장의 구독자들에게 이벤트 상태 변경 알림 발송
     */
    @Transactional
    public int notifyStatusChange(String theaterId, String theaterName, String eventTitle, String newStatus) {
        List<TheaterSubscription> subscriptions = subscriptionRepository.findByTheaterId(theaterId);

        List<Member> eligibleMembers = subscriptions.stream()
                .map(TheaterSubscription::getMember)
                .filter(Member::isNotificationEnabled)
                .collect(Collectors.toList());

        List<String> fcmTokens = eligibleMembers.stream()
                .map(Member::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());

        if (fcmTokens.isEmpty()) {
            return 0;
        }

        log.info("극장 {} 구독자 {}명에게 상태 변경 알림 발송", theaterName, fcmTokens.size());
        PushNotificationService.SendResult result =
                pushNotificationService.sendStockUpdateNotification(fcmTokens, theaterName, eventTitle, newStatus);

        // 알림 히스토리 저장
        String title = "이벤트 상태 변경";
        String body = String.format("%s - %s 상태가 [%s](으)로 변경되었습니다", theaterName, eventTitle, newStatus);
        saveNotificationHistory(eligibleMembers, title, body);

        // 무효 토큰 정리
        cleanupInvalidTokens(result.invalidTokens());

        return result.successCount();
    }

    /**
     * 찜(EventSubscription) 이벤트의 구독자들에게 상태 변경 알림 발송
     */
    @Transactional
    public int notifyEventSubscribers(String eventId, String eventTitle, String newStatus) {
        List<EventSubscription> subscriptions = eventFavoriteRepository.findByEventId(eventId);

        List<Member> eligibleMembers = subscriptions.stream()
                .map(EventSubscription::getMember)
                .filter(Member::isNotificationEnabled)
                .collect(Collectors.toList());

        List<String> fcmTokens = eligibleMembers.stream()
                .map(Member::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());

        if (fcmTokens.isEmpty()) {
            log.info("이벤트 {}의 찜 구독자 중 알림 가능한 사용자가 없습니다.", eventTitle);
            return 0;
        }

        log.info("이벤트 '{}' 찜 구독자 {}명에게 알림 발송", eventTitle, fcmTokens.size());
        PushNotificationService.SendResult result =
                pushNotificationService.sendFavoriteEventNotification(fcmTokens, eventTitle, newStatus);

        // 알림 히스토리 저장
        String title = "찜한 이벤트 상태 변경";
        String body = String.format("찜한 이벤트 '%s'의 상태가 [%s](으)로 변경되었습니다", eventTitle, newStatus);
        saveNotificationHistory(eligibleMembers, title, body);

        // 무효 토큰 정리
        cleanupInvalidTokens(result.invalidTokens());

        return result.successCount();
    }

    private void saveNotificationHistory(List<Member> members, String title, String body) {
        List<NotificationHistory> histories = members.stream()
                .map(member -> NotificationHistory.create(member, title, body))
                .collect(Collectors.toList());
        notificationHistoryRepository.saveAll(histories);
    }

    private void cleanupInvalidTokens(List<String> invalidTokens) {
        if (invalidTokens != null && !invalidTokens.isEmpty()) {
            log.info("무효 FCM 토큰 {}개 정리", invalidTokens.size());
            memberRepository.clearInvalidFcmTokens(invalidTokens);
        }
    }
}
