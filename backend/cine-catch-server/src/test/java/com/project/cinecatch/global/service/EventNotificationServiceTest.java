package com.project.cinecatch.global.service;

import com.project.cinecatch.domain.member.entity.EventSubscription;
import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.entity.TheaterSubscription;
import com.project.cinecatch.domain.member.repository.EventFavoriteRepository;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import com.project.cinecatch.domain.member.repository.SubscriptionRepository;
import com.project.cinecatch.domain.notification.repository.NotificationHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventNotificationServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private EventFavoriteRepository eventFavoriteRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PushNotificationService pushNotificationService;

    @Mock
    private NotificationHistoryRepository notificationHistoryRepository;

    @InjectMocks
    private EventNotificationService eventNotificationService;

    private Member createMember(String email, String fcmToken, boolean notificationEnabled) {
        Member member = Member.builder()
                .email(email)
                .password("password")
                .nickname(email)
                .build();
        member.updateFcmToken(fcmToken);
        member.updateNotificationEnabled(notificationEnabled);
        return member;
    }

    @Test
    void notifySubscribers_구독자에게_알림_발송() {
        Member member = createMember("user@test.com", "token1", true);
        TheaterSubscription subscription = mock(TheaterSubscription.class);
        when(subscription.getMember()).thenReturn(member);
        when(subscriptionRepository.findByTheaterId("theater1")).thenReturn(List.of(subscription));
        when(pushNotificationService.sendEventUpdateNotification(anyList(), anyString(), anyString()))
                .thenReturn(new PushNotificationService.SendResult(1, List.of()));

        int result = eventNotificationService.notifySubscribers("theater1", "CGV 강남", "어벤져스");

        assertThat(result).isEqualTo(1);
        verify(pushNotificationService).sendEventUpdateNotification(
                eq(List.of("token1")), eq("CGV 강남"), eq("어벤져스"));
        verify(notificationHistoryRepository).saveAll(anyList());
    }

    @Test
    void notifySubscribers_FCM토큰_없는_사용자_필터링() {
        Member memberWithToken = createMember("user1@test.com", "token1", true);
        Member memberWithoutToken = createMember("user2@test.com", null, true);

        TheaterSubscription sub1 = mock(TheaterSubscription.class);
        TheaterSubscription sub2 = mock(TheaterSubscription.class);
        when(sub1.getMember()).thenReturn(memberWithToken);
        when(sub2.getMember()).thenReturn(memberWithoutToken);
        when(subscriptionRepository.findByTheaterId("theater1")).thenReturn(List.of(sub1, sub2));
        when(pushNotificationService.sendEventUpdateNotification(anyList(), anyString(), anyString()))
                .thenReturn(new PushNotificationService.SendResult(1, List.of()));

        int result = eventNotificationService.notifySubscribers("theater1", "CGV 강남", "어벤져스");

        assertThat(result).isEqualTo(1);
        verify(pushNotificationService).sendEventUpdateNotification(
                eq(List.of("token1")), anyString(), anyString());
    }

    @Test
    void notifySubscribers_알림비활성화_사용자_필터링() {
        Member enabledMember = createMember("user1@test.com", "token1", true);
        Member disabledMember = createMember("user2@test.com", "token2", false);

        TheaterSubscription sub1 = mock(TheaterSubscription.class);
        TheaterSubscription sub2 = mock(TheaterSubscription.class);
        when(sub1.getMember()).thenReturn(enabledMember);
        when(sub2.getMember()).thenReturn(disabledMember);
        when(subscriptionRepository.findByTheaterId("theater1")).thenReturn(List.of(sub1, sub2));
        when(pushNotificationService.sendEventUpdateNotification(anyList(), anyString(), anyString()))
                .thenReturn(new PushNotificationService.SendResult(1, List.of()));

        int result = eventNotificationService.notifySubscribers("theater1", "CGV 강남", "어벤져스");

        assertThat(result).isEqualTo(1);
        verify(pushNotificationService).sendEventUpdateNotification(
                eq(List.of("token1")), anyString(), anyString());
    }

    @Test
    void notifySubscribers_구독자_없을때_0_반환() {
        when(subscriptionRepository.findByTheaterId("theater1")).thenReturn(List.of());

        int result = eventNotificationService.notifySubscribers("theater1", "CGV 강남", "어벤져스");

        assertThat(result).isEqualTo(0);
        verifyNoInteractions(pushNotificationService);
    }

    @Test
    void notifyEventSubscribers_찜_구독자에게_알림_발송() {
        Member member = createMember("user@test.com", "token1", true);
        EventSubscription subscription = mock(EventSubscription.class);
        when(subscription.getMember()).thenReturn(member);
        when(eventFavoriteRepository.findByEventId("event1")).thenReturn(List.of(subscription));
        when(pushNotificationService.sendFavoriteEventNotification(anyList(), anyString(), anyString()))
                .thenReturn(new PushNotificationService.SendResult(1, List.of()));

        int result = eventNotificationService.notifyEventSubscribers("event1", "어벤져스", "보유");

        assertThat(result).isEqualTo(1);
        verify(pushNotificationService).sendFavoriteEventNotification(
                eq(List.of("token1")), eq("어벤져스"), eq("보유"));
        verify(notificationHistoryRepository).saveAll(anyList());
    }

    @Test
    void notifyStatusChange_무효토큰_정리() {
        Member member = createMember("user@test.com", "invalid-token", true);
        TheaterSubscription subscription = mock(TheaterSubscription.class);
        when(subscription.getMember()).thenReturn(member);
        when(subscriptionRepository.findByTheaterId("theater1")).thenReturn(List.of(subscription));
        when(pushNotificationService.sendStockUpdateNotification(anyList(), anyString(), anyString(), anyString()))
                .thenReturn(new PushNotificationService.SendResult(0, List.of("invalid-token")));

        eventNotificationService.notifyStatusChange("theater1", "CGV 강남", "어벤져스", "마감");

        verify(memberRepository).clearInvalidFcmTokens(List.of("invalid-token"));
    }
}
