package com.project.cinecatch.domain.event.repository;

import com.project.cinecatch.domain.event.entity.EventLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventLocationRepository extends JpaRepository<EventLocation, Long> {

    @Query("SELECT el FROM EventLocation el JOIN FETCH el.theater WHERE el.event.id = :eventId")
    List<EventLocation> findByEventIdWithTheater(@Param("eventId") String eventId);

    @Query("SELECT el FROM EventLocation el JOIN FETCH el.theater JOIN FETCH el.event WHERE el.theater.id = :theaterId")
    List<EventLocation> findByTheaterIdWithEvent(@Param("theaterId") String theaterId);

    @Query("SELECT el FROM EventLocation el JOIN FETCH el.theater WHERE el.event.id = :eventId AND el.theater.id IN :theaterIds")
    List<EventLocation> findByEventIdAndTheaterIds(
            @Param("eventId") String eventId,
            @Param("theaterIds") List<String> theaterIds
    );

    @Query("""
        SELECT el FROM EventLocation el
        JOIN FETCH el.theater t
        JOIN FETCH el.event e
        JOIN FETCH e.movie
        WHERE t.id IN :theaterIds
        AND e.endAt >= CURRENT_TIMESTAMP
        ORDER BY e.startAt DESC
        """)
    List<EventLocation> findActiveEventsByTheaterIds(@Param("theaterIds") List<String> theaterIds);
}
