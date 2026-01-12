package com.project.cinecatch.domain.event.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventRequest {
    private String brand;
    private String movieTitle;
    private Boolean isAvailableOnly;

    private Double latitude;
    private Double longitude;
}