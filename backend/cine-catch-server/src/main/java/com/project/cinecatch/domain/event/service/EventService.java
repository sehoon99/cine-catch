package com.project.cinecatch.domain.event.service;

import com.project.cinecatch.domain.event.dto.EventResponse;
import com.project.cinecatch.domain.event.dto.TheaterEventResponse;
import com.project.cinecatch.domain.event.entity.Event;
import com.project.cinecatch.domain.event.entity.EventLocation;
import com.project.cinecatch.domain.event.repository.EventLocationRepository;
import com.project.cinecatch.domain.event.repository.EventRepository;
import com.project.cinecatch.domain.theater.entity.Theater;
import com.project.cinecatch.domain.theater.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final EventLocationRepository eventLocationRepository;
    private final TheaterService theaterService;

    private static final double DEFAULT_RADIUS_METERS = 5000.0; // 5km

    public List<EventResponse> getAllActiveEvents() {
        List<Event> events = eventRepository.findActiveEvents(LocalDateTime.now());
        return events.stream()
                .map(event -> {
                    List<EventLocation> locations = eventLocationRepository.findByEventIdWithTheater(event.getId());
                    return EventResponse.of(event, locations);
                })
                .collect(Collectors.toList());
    }

    public List<EventResponse> getNearbyEvents(double latitude, double longitude, Double radiusMeters) {
        double radius = radiusMeters != null ? radiusMeters : DEFAULT_RADIUS_METERS;

        List<Theater> nearbyTheaters = theaterService.findNearbyTheaterEntities(latitude, longitude, radius);
        if (nearbyTheaters.isEmpty()) {
            return List.of();
        }

        List<String> theaterIds = nearbyTheaters.stream()
                .map(Theater::getId)
                .collect(Collectors.toList());

        List<EventLocation> locations = eventLocationRepository.findActiveEventsByTheaterIds(theaterIds);

        Map<Event, List<EventLocation>> eventLocationMap = locations.stream()
                .collect(Collectors.groupingBy(EventLocation::getEvent));

        return eventLocationMap.entrySet().stream()
                .map(entry -> EventResponse.of(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    public EventResponse getEventDetail(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        List<EventLocation> locations = eventLocationRepository.findByEventIdWithTheater(eventId);
        return EventResponse.of(event, locations);
    }

    public EventResponse getEventDetailNearby(String eventId, double latitude, double longitude, Double radiusMeters) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        double radius = radiusMeters != null ? radiusMeters : DEFAULT_RADIUS_METERS;
        List<Theater> nearbyTheaters = theaterService.findNearbyTheaterEntities(latitude, longitude, radius);

        List<String> theaterIds = nearbyTheaters.stream()
                .map(Theater::getId)
                .collect(Collectors.toList());

        List<EventLocation> locations = eventLocationRepository.findByEventIdAndTheaterIds(eventId, theaterIds);
        return EventResponse.of(event, locations);
    }

    public List<EventResponse> searchByMovieTitle(String movieTitle) {
        List<Event> events = eventRepository.findByMovieTitleContaining(movieTitle, LocalDateTime.now());
        return events.stream()
                .map(event -> {
                    List<EventLocation> locations = eventLocationRepository.findByEventIdWithTheater(event.getId());
                    return EventResponse.of(event, locations);
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 극장에서 진행 중인 이벤트 목록 조회
     */
    public List<TheaterEventResponse> getEventsByTheaterId(String theaterId) {
        List<EventLocation> locations = eventLocationRepository.findByTheaterIdWithEvent(theaterId);

        // 현재 시간 이후에 끝나는 이벤트만 필터링 (진행 중인 이벤트)
        LocalDateTime now = LocalDateTime.now();

        return locations.stream()
                .filter(loc -> loc.getEvent().getEndAt().isAfter(now))
                .map(TheaterEventResponse::of)
                .collect(Collectors.toList());
    }
}
