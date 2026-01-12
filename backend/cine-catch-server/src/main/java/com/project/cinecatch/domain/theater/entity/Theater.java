package com.project.cinecatch.domain.theater.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "theaters")
public class Theater {

    @Id
    private Long id;

    @Column(length = 20, nullable = false)
    private String brand; // CGV

    @Column(nullable = false, columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;
}