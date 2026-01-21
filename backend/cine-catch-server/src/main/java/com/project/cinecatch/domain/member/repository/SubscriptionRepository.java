package com.project.cinecatch.domain.member.repository;

import com.project.cinecatch.domain.member.entity.TheaterSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<TheaterSubscription, UUID> {

    List<TheaterSubscription> findByMemberId(UUID memberId);

    @Query("SELECT ts.theater.id FROM TheaterSubscription ts WHERE ts.member.id = :memberId")
    Set<String> findTheaterIdsByMemberId(@Param("memberId") UUID memberId);

    boolean existsByMemberIdAndTheaterId(UUID memberId, String theaterId);

    void deleteByMemberIdAndTheaterId(UUID memberId, String theaterId);

    // 특정 극장을 구독한 모든 사용자 조회 (알림 발송용)
    List<TheaterSubscription> findByTheaterId(String theaterId);
}
