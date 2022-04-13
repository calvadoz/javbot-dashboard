import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LikedMovie = ({
  likedMovies,
  onFavoriteMovieSelectedButton,
  onAddToLikedMovie,
}) => {
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
        {likedMovies.length === 0 && <h2>No Liked Movies, you may close the dialog</h2>}
        {likedMovies.length > 0 &&
          likedMovies.map((likedMovie, index) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 * index } }}
              exit={{ opacity: 0 }}
              key={likedMovie.movieId}
            >
              <p className="liked-movie-title">
                <span>{likedMovie.movieId}</span>
                <button
                  onClick={() => onAddToLikedMovie(likedMovie)}
                  className="delete-button-icon"
                  title="Remove from Liked Movies"
                >
                  <FontAwesomeIcon
                    className="sort-icon"
                    icon={["fas", "trash"]}
                  />
                </button>
              </p>
              <img
                onClick={() => onFavoriteMovieSelectedButton(likedMovie)}
                src={likedMovie.thumbnail}
                alt="movie-thumbnail"
              />
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default LikedMovie;
