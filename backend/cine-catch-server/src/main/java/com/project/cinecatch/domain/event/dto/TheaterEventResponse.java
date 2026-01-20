package com.project.cinecatch.domain.event.dto;

import com.project.cinecatch.domain.event.entity.Event;
import com.project.cinecatch.domain.event.entity.EventLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheaterEventResponse {

    private String eventId;
    private String title;
    private String movieTitle;
    private String type;        // GOODS, COUPON, GV
    private String status;      // 재고 상태
    private String imageUrl;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public static TheaterEventResponse of(EventLocation location) {
        Event event = location.getEvent();

        String type = event.getType() != null ? event.getType().name() : "UNKNOWN";

        return TheaterEventResponse.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .movieTitle(event.getMovie().getTitle())
                .type(type)
                .status(location.getStatus())
                .imageUrl(event.getMovie().getImage())
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .build();
    }
}
