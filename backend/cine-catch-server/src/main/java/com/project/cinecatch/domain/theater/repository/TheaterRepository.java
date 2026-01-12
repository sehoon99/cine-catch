package com.project.cinecatch.domain.theater.repository;

import com.project.cinecatch.domain.theater.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TheaterRepository extends JpaRepository<Theater, String> {

    List<Theater> findByBrand(String brand);

    List<Theater> findByNameContaining(String name);

    @Query(value = """
        SELECT * FROM theaters t
        WHERE ST_DWithin(
            t.location::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :radiusMeters
        )
        ORDER BY ST_Distance(
            t.location::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )
        """, nativeQuery = true)
    List<Theater> findNearbyTheaters(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radiusMeters") double radiusMeters
    );
}
