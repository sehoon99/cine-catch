package com.project.cinecatch.domain.member.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SubscriptionRequest {

    @NotBlank(message = "theaterId is required")
    private String theaterId;
}
