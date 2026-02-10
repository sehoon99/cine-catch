package com.project.cinecatch.domain.member.repository;

import com.project.cinecatch.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {

    // 1. 로그인할 때 이메일로 사용자를 찾아야 함~함
    Optional<Member> findByEmail(String email);

    // 2. 회원가입 시 이미 가입된 이메일인지 확인해야 함~함
    boolean existsByEmail(String email);

    // 3. 닉네임 중복 체크도 필요하다면 추가함~함
    boolean existsByNickname(String nickname);

    @Modifying
    @Query("UPDATE Member m SET m.fcmToken = null WHERE m.fcmToken IN :tokens")
    void clearInvalidFcmTokens(@Param("tokens") List<String> tokens);
}