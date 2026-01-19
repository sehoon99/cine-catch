package com.project.cinecatch.domain.member.service;

import com.project.cinecatch.domain.member.dto.LoginRequest;
import com.project.cinecatch.domain.member.dto.MemberRequest;
import com.project.cinecatch.domain.member.dto.TokenResponse;
import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.project.cinecatch.global.security.JwtTokenProvider jwtTokenProvider;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(),4326);

    public void signUp(MemberRequest request) {
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        memberRepository.save(member);
    }

    public TokenResponse login(LoginRequest request) {
        // 1. 이메일로 유저 찾기
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        // 2. 비밀번호 일치 확인 (암호화된 비번은 matches로 비교해야 함~함)
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 토큰 생성 및 반환
        return jwtTokenProvider.createToken(member.getEmail(), member.getRole());
    }
}
