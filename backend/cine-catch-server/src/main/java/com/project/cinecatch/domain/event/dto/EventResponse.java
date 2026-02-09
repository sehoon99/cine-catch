package com.project.cinecatch.domain.event.dto;

import com.project.cinecatch.domain.event.entity.Event;
import com.project.cinecatch.domain.event.entity.EventLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private String eventId;
    private String movieTitle;
    private String goodsTitle;
    private String imageUrl;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private List<TheaterInventory> theaters;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TheaterInventory {
        private String theaterId;
        private String theaterName;
        private String address;
        private Double latitude;
        private Double longitude;
        private String status;
    }


    public static EventResponse of(Event event, List<EventLocation> locations) {

        List<TheaterInventory> theaterList = locations.stream()
                .map(loc -> TheaterInventory.builder()
                        .theaterId(loc.getTheater().getId())
                        .theaterName(loc.getTheater().getName())
                        .address(loc.getTheater().getAddress())
                        .latitude(loc.getTheater().getLocation() != null ? loc.getTheater().getLocation().getY() : null)
                        .longitude(loc.getTheater().getLocation() != null ? loc.getTheater().getLocation().getX() : null)
                        .status(loc.getStatus())
                        .build())
                .collect(Collectors.toList());

        return EventResponse.builder()
                .eventId(event.getId())
                .movieTitle(event.getMovie().getTitle())
                .goodsTitle(event.getTitle())
                .imageUrl(event.getMovie().getImage())
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .theaters(theaterList)
                .build();
    }
}