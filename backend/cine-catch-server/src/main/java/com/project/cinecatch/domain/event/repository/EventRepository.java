package com.project.cinecatch.domain.event.repository;

import com.project.cinecatch.domain.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, String> {

    @Query("SELECT e FROM Event e JOIN FETCH e.movie WHERE e.endAt >= :now ORDER BY e.startAt DESC")
    List<Event> findActiveEvents(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e JOIN FETCH e.movie WHERE e.movie.title LIKE %:title% AND e.endAt >= :now")
    List<Event> findByMovieTitleContaining(@Param("title") String title, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM Event e JOIN FETCH e.movie ORDER BY e.startAt DESC")
    List<Event> findAllWithMovie();
}
