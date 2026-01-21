package com.project.cinecatch.domain.member.service;

import com.project.cinecatch.domain.member.dto.SubscriptionRequest;
import com.project.cinecatch.domain.member.dto.SubscriptionResponse;
import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.entity.TheaterSubscription;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import com.project.cinecatch.domain.member.repository.SubscriptionRepository;
import com.project.cinecatch.domain.theater.entity.Theater;
import com.project.cinecatch.domain.theater.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final MemberRepository memberRepository;
    private final TheaterRepository theaterRepository;

    public List<SubscriptionResponse> getMySubscriptions(String email) {
        Member member = getMemberByEmail(email);
        return subscriptionRepository.findByMemberId(member.getId())
                .stream()
                .map(SubscriptionResponse::from)
                .toList();
    }

    public Set<String> getSubscribedTheaterIds(String email) {
        Member member = getMemberByEmail(email);
        return subscriptionRepository.findTheaterIdsByMemberId(member.getId());
    }

    @Transactional
    public SubscriptionResponse subscribe(String email, SubscriptionRequest request) {
        Member member = getMemberByEmail(email);
        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + request.getTheaterId()));

        if (subscriptionRepository.existsByMemberIdAndTheaterId(member.getId(), theater.getId())) {
            throw new IllegalStateException("Already subscribed to this theater");
        }

        TheaterSubscription subscription = TheaterSubscription.create(member, theater);
        TheaterSubscription saved = subscriptionRepository.save(subscription);
        return SubscriptionResponse.from(saved);
    }

    @Transactional
    public void unsubscribe(String email, String theaterId) {
        Member member = getMemberByEmail(email);

        if (!subscriptionRepository.existsByMemberIdAndTheaterId(member.getId(), theaterId)) {
            throw new IllegalArgumentException("Subscription not found");
        }

        subscriptionRepository.deleteByMemberIdAndTheaterId(member.getId(), theaterId);
    }

    private Member getMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + email));
    }
}
