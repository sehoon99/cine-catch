package com.project.cinecatch.domain.notification.service;

import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import com.project.cinecatch.domain.notification.entity.NotificationHistory;
import com.project.cinecatch.domain.notification.repository.NotificationHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationHistoryService {

    private final NotificationHistoryRepository notificationHistoryRepository;
    private final MemberRepository memberRepository;

    public void saveNotification(Member member, String title, String body) {
        NotificationHistory history = NotificationHistory.create(member, title, body);
        notificationHistoryRepository.save(history);
    }

    public List<NotificationHistory> getNotifications(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        return notificationHistoryRepository.findByMemberIdOrderByCreatedAtDesc(member.getId());
    }

    public void markAsRead(String email, UUID notificationId) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        NotificationHistory notification = notificationHistoryRepository
                .findByIdAndMemberId(notificationId, member.getId())
                .orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다."));
        notification.markAsRead();
    }

    public int getUnreadCount(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        return notificationHistoryRepository.countByMemberIdAndIsReadFalse(member.getId());
    }
}
