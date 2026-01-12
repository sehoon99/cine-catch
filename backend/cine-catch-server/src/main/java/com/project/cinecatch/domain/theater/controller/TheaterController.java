package com.project.cinecatch.domain.theater.controller;

import com.project.cinecatch.domain.theater.dto.TheaterResponse;
import com.project.cinecatch.domain.theater.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@RequiredArgsConstructor
public class TheaterController {

    private final TheaterService theaterService;

    @GetMapping
    public ResponseEntity<List<TheaterResponse>> getAllTheaters(
            @RequestParam(required = false) String brand
    ) {
        List<TheaterResponse> theaters;
        if (brand != null && !brand.isEmpty()) {
            theaters = theaterService.getTheatersByBrand(brand);
        } else {
            theaters = theaterService.getAllTheaters();
        }
        return ResponseEntity.ok(theaters);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<TheaterResponse>> getNearbyTheaters(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) Double radius
    ) {
        List<TheaterResponse> theaters = theaterService.getNearbyTheaters(lat, lng, radius);
        return ResponseEntity.ok(theaters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheaterResponse> getTheaterById(@PathVariable String id) {
        TheaterResponse theater = theaterService.getTheaterById(id);
        return ResponseEntity.ok(theater);
    }
}
