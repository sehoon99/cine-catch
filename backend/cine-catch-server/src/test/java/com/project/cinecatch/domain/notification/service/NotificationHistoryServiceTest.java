package com.project.cinecatch.domain.notification.service;

import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import com.project.cinecatch.domain.notification.entity.NotificationHistory;
import com.project.cinecatch.domain.notification.repository.NotificationHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationHistoryServiceTest {

    @Mock
    private NotificationHistoryRepository notificationHistoryRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private NotificationHistoryService notificationHistoryService;

    private Member createMember(String email) {
        return Member.builder()
                .email(email)
                .password("password")
                .nickname(email)
                .build();
    }

    @Test
    void saveNotification_알림_저장() {
        Member member = createMember("user@test.com");

        notificationHistoryService.saveNotification(member, "제목", "내용");

        ArgumentCaptor<NotificationHistory> captor = ArgumentCaptor.forClass(NotificationHistory.class);
        verify(notificationHistoryRepository).save(captor.capture());

        NotificationHistory saved = captor.getValue();
        assertThat(saved.getTitle()).isEqualTo("제목");
        assertThat(saved.getBody()).isEqualTo("내용");
        assertThat(saved.isRead()).isFalse();
    }

    @Test
    void getNotifications_알림_목록_조회() {
        Member member = createMember("user@test.com");
        when(memberRepository.findByEmail("user@test.com")).thenReturn(Optional.of(member));

        NotificationHistory notification = NotificationHistory.create(member, "제목", "내용");
        when(notificationHistoryRepository.findByMemberIdOrderByCreatedAtDesc(member.getId()))
                .thenReturn(List.of(notification));

        List<NotificationHistory> result = notificationHistoryService.getNotifications("user@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("제목");
    }

    @Test
    void markAsRead_읽음_처리() {
        Member member = createMember("user@test.com");
        when(memberRepository.findByEmail("user@test.com")).thenReturn(Optional.of(member));

        UUID notificationId = UUID.randomUUID();
        NotificationHistory notification = NotificationHistory.create(member, "제목", "내용");
        when(notificationHistoryRepository.findByIdAndMemberId(notificationId, member.getId()))
                .thenReturn(Optional.of(notification));

        notificationHistoryService.markAsRead("user@test.com", notificationId);

        assertThat(notification.isRead()).isTrue();
    }

    @Test
    void markAsRead_존재하지_않는_알림() {
        Member member = createMember("user@test.com");
        when(memberRepository.findByEmail("user@test.com")).thenReturn(Optional.of(member));

        UUID notificationId = UUID.randomUUID();
        when(notificationHistoryRepository.findByIdAndMemberId(notificationId, member.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationHistoryService.markAsRead("user@test.com", notificationId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("알림을 찾을 수 없습니다.");
    }

    @Test
    void getUnreadCount_읽지않은_수_조회() {
        Member member = createMember("user@test.com");
        when(memberRepository.findByEmail("user@test.com")).thenReturn(Optional.of(member));
        when(notificationHistoryRepository.countByMemberIdAndIsReadFalse(member.getId())).thenReturn(5);

        int count = notificationHistoryService.getUnreadCount("user@test.com");

        assertThat(count).isEqualTo(5);
    }
}
