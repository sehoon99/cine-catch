package com.project.cinecatch.domain.movie.dto;

import com.project.cinecatch.domain.movie.entity.Movie;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieDetailResponse {
    private String id;
    private String title;
    private String director;
    private String genre;
    private String imageUrl;
    private LocalDate releaseDate;

    public static MovieDetailResponse from(Movie movie) {
        return MovieDetailResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .director(movie.getDirector())
                .genre(movie.getGenre())
                .imageUrl(movie.getImage())
                .releaseDate(movie.getReleaseDate())
                .build();
    }
}