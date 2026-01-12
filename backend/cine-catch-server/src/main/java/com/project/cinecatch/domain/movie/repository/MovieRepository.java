package com.project.cinecatch.domain.movie.repository;

import com.project.cinecatch.domain.movie.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findByTitle(String title);

    List<Movie> findByTitleContaining(String title);
}
