package com.project.cinecatch.domain.event.entity;

import com.project.cinecatch.domain.movie.entity.Movie;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "events")
public class Event {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_title", nullable = false)
    private Movie movie;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private EventType type; // Goods, Coupon, GV

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    private Integer viewCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum EventType { GOODS, COUPON, GV }
}