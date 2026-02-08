package com.project.cinecatch.domain.member.repository;

import com.project.cinecatch.domain.member.entity.EventSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface EventFavoriteRepository extends JpaRepository<EventSubscription, UUID> {

    @Query("SELECT es.event.id FROM EventSubscription es WHERE es.member.id = :memberId")
    Set<String> findEventIdsByMemberId(@Param("memberId") UUID memberId);

    boolean existsByMemberIdAndEventId(UUID memberId, String eventId);

    void deleteByMemberIdAndEventId(UUID memberId, String eventId);
}
