package com.project.cinecatch.domain.event.dto;

import com.project.cinecatch.domain.event.entity.Event;
import com.project.cinecatch.domain.event.entity.EventLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private Long eventId;
    private String movieTitle;
    private String goodsTitle;
    private String imageUrl;

    private List<TheaterInventory> theaters;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TheaterInventory {
        private String theaterName;
        private String status;
    }


    public static EventResponse of(Event event, List<EventLocation> locations) {

        List<TheaterInventory> theaterList = locations.stream()
                .map(loc -> TheaterInventory.builder()
                        .theaterName(loc.getTheater().getName())
                        .status(loc.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        return EventResponse.builder()
                .eventId(event.getId())
                .movieTitle(event.getMovie().getTitle())
                .goodsTitle(event.getTitle())
                .imageUrl(event.getMovie().getImage())
                .theaters(theaterList)
                .build();
    }
}