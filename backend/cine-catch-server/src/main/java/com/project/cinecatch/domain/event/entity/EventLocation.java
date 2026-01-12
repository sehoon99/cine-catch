package com.project.cinecatch.domain.event.entity;

import com.project.cinecatch.domain.theater.entity.Theater;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "event_location")
public class EventLocation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private EventStatus status; // Available, SoldOut, Scarce, Unknown

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum EventStatus { Available, SoldOut, Scarce, Unknown }
}