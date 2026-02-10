package com.project.cinecatch.domain.notification.repository;

import com.project.cinecatch.domain.notification.entity.NotificationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, UUID> {

    List<NotificationHistory> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    int countByMemberIdAndIsReadFalse(UUID memberId);

    Optional<NotificationHistory> findByIdAndMemberId(UUID id, UUID memberId);
}
