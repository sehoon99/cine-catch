package com.project.cinecatch.domain.event.controller;

import com.project.cinecatch.domain.event.dto.EventResponse;
import com.project.cinecatch.domain.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String movieTitle
    ) {
        List<EventResponse> events;

        if (movieTitle != null && !movieTitle.isEmpty()) {
            events = eventService.searchByMovieTitle(movieTitle);
        } else if (lat != null && lng != null) {
            events = eventService.getNearbyEvents(lat, lng, radius);
        } else {
            events = eventService.getAllActiveEvents();
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<EventResponse>> getNearbyEvents(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) Double radius
    ) {
        List<EventResponse> events = eventService.getNearbyEvents(lat, lng, radius);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventDetail(
            @PathVariable String eventId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius
    ) {
        EventResponse event;

        if (lat != null && lng != null) {
            event = eventService.getEventDetailNearby(eventId, lat, lng, radius);
        } else {
            event = eventService.getEventDetail(eventId);
        }

        return ResponseEntity.ok(event);
    }
}
