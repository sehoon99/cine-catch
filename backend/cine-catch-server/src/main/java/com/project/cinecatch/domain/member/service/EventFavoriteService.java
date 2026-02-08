package com.project.cinecatch.domain.member.service;

import com.project.cinecatch.domain.event.entity.Event;
import com.project.cinecatch.domain.event.repository.EventRepository;
import com.project.cinecatch.domain.member.entity.EventSubscription;
import com.project.cinecatch.domain.member.entity.Member;
import com.project.cinecatch.domain.member.repository.EventFavoriteRepository;
import com.project.cinecatch.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventFavoriteService {

    private final EventFavoriteRepository eventFavoriteRepository;
    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;

    public Set<String> getFavoriteEventIds(String email) {
        Member member = getMemberByEmail(email);
        return eventFavoriteRepository.findEventIdsByMemberId(member.getId());
    }

    @Transactional
    public void addFavorite(String email, String eventId) {
        Member member = getMemberByEmail(email);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        if (eventFavoriteRepository.existsByMemberIdAndEventId(member.getId(), eventId)) {
            throw new IllegalStateException("Already favorited this event");
        }

        EventSubscription subscription = EventSubscription.create(member, event);
        eventFavoriteRepository.save(subscription);
    }

    @Transactional
    public void removeFavorite(String email, String eventId) {
        Member member = getMemberByEmail(email);

        if (!eventFavoriteRepository.existsByMemberIdAndEventId(member.getId(), eventId)) {
            throw new IllegalArgumentException("Favorite not found");
        }

        eventFavoriteRepository.deleteByMemberIdAndEventId(member.getId(), eventId);
    }

    private Member getMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + email));
    }
}
