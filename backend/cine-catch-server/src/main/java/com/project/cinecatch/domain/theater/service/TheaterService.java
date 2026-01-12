package com.project.cinecatch.domain.theater.service;

import com.project.cinecatch.domain.theater.dto.TheaterResponse;
import com.project.cinecatch.domain.theater.entity.Theater;
import com.project.cinecatch.domain.theater.repository.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TheaterService {

    private final TheaterRepository theaterRepository;

    private static final double DEFAULT_RADIUS_METERS = 5000.0; // 5km

    public List<TheaterResponse> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(TheaterResponse::from)
                .collect(Collectors.toList());
    }

    public List<TheaterResponse> getTheatersByBrand(String brand) {
        return theaterRepository.findByBrand(brand).stream()
                .map(TheaterResponse::from)
                .collect(Collectors.toList());
    }

    public List<TheaterResponse> getNearbyTheaters(double latitude, double longitude, Double radiusMeters) {
        double radius = radiusMeters != null ? radiusMeters : DEFAULT_RADIUS_METERS;
        return theaterRepository.findNearbyTheaters(latitude, longitude, radius).stream()
                .map(TheaterResponse::from)
                .collect(Collectors.toList());
    }

    public TheaterResponse getTheaterById(String id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + id));
        return TheaterResponse.from(theater);
    }

    public List<Theater> findNearbyTheaterEntities(double latitude, double longitude, double radiusMeters) {
        return theaterRepository.findNearbyTheaters(latitude, longitude, radiusMeters);
    }
}
