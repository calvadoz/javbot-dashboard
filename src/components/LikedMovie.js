import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LikedMovie = ({ likedMovies, onFavoriteMovieSelectedButton }) => {
  return (
    <div className="liked-movies-wrapper">
      <h2 style={{ borderBottom: "1px solid", paddingBottom: ".5em" }}>
        <FontAwesomeIcon className="sort-icon" icon={["fas", "heart"]} />
        <span style={{ margin: "1em" }}>Liked Movies</span>
        <FontAwesomeIcon className="sort-icon" icon={["fas", "heart"]} />
      </h2>
      <div className="note-wrapper">
        <span style={{ fontStyle: "italic", fontSize: "0.9em" }}>
          <b>NOTES:</b> Liked movie(s) are impermanent due to anonymity and
          privacy so that everyone can enjoy adding movies to their favorite
          list. Since movie list are kept in local storage, if you wish to
          persist your list, do NOT use incognito mode since incognito will NOT
          keep any trace of data. Enjoy{" "}
          <FontAwesomeIcon className="sort-icon" icon={["fas", "heart"]} />
        </span>
      </div>
      <div className="liked-movie-thumbnail-wrapper">
        {likedMovies.map((likedMovie) => (
          <div key={likedMovie.movieId}>
            <p>{likedMovie.movieId}</p>
            <img
              onClick={() => onFavoriteMovieSelectedButton(likedMovie)}
              src={likedMovie.thumbnail}
              alt="movie-thumbnail"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedMovie;
