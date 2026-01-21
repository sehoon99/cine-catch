package com.project.cinecatch.domain.member.dto;

import com.project.cinecatch.domain.member.entity.TheaterSubscription;
import com.project.cinecatch.domain.theater.entity.Theater;
import lombok.Builder;
import lombok.Getter;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class SubscriptionResponse {

    private UUID id;
    private String theaterId;
    private String theaterName;
    private String brand;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDateTime subscribedAt;

    public static SubscriptionResponse from(TheaterSubscription subscription) {
        Theater theater = subscription.getTheater();
        Point location = theater.getLocation();

        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .theaterId(theater.getId())
                .theaterName(theater.getName())
                .brand(theater.getBrand())
                .address(theater.getAddress())
                .latitude(location != null ? location.getY() : null)
                .longitude(location != null ? location.getX() : null)
                .subscribedAt(subscription.getCreatedAt())
                .build();
    }
}
