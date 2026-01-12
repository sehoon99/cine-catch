package com.project.cinecatch.domain.theater.dto;

import com.project.cinecatch.domain.theater.entity.Theater;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TheaterResponse {
    private String id;
    private String brand;
    private String name;
    private String address;

    private Double latitude;
    private Double longitude;

    public static TheaterResponse from(Theater theater) {
        return TheaterResponse.builder()
                .id(theater.getId())
                .brand(theater.getBrand())
                .name(theater.getName())
                .address(theater.getAddress())
                .latitude(theater.getLocation() != null ? theater.getLocation().getY() : null)
                .longitude(theater.getLocation() != null ? theater.getLocation().getX() : null)
                .build();
    }
}