import dayjs from "dayjs";
import React from "react";

const MovieDetails = ({ movie, setShowModal, onShowTrailer }) => {
  return (
    <React.Fragment>
      <p className="modal-movie-id">
        {movie.movieId || movie.id} -{" "}
        <span
          style={{ fontSize: "80%", fontWeight: "normal" }}
          title={movie.releaseDate}
        >
          {dayjs().to(dayjs(movie.releaseDate))}
        </span>
      </p>
      {/* Video Container */}
      <div className="javadoz-video-container">
        {!movie.trailer && <h2>No Trailer Available</h2>}
        {movie.trailer && (
          <video className="javadoz-video" poster={movie.thumbnail} controls>
            <source src={movie.trailer} type="video/mp4" />
          </video>
        )}
      </div>
      {/* <div className="play-full-movie-container">
        <button
          onClick={() => window.open(movie.fullMovieUrl, "_blank")}
          className="play-full-movie-button"
          disabled={!movie.fullMovieUrl}
        >
          <FontAwesomeIcon
            className="play-icon"
            icon={["fas", "circle-play"]}
          />
          Play Full Movie
        </button>
      </div> */}
      {/* --------------------- */}
      {/* Movie Details Container */}
      <div className="javadoz-video-details-container">
        {/* Title */}
        <div className="javadoz-video-details-categories">
          <p className="javadoz-video-details-label">Title</p>
          <p className="javadoz-video-details-text">{movie.title}</p>
        </div>
        {/* Actresses */}
        <div className="javadoz-video-details-categories">
          <p className="javadoz-video-details-label">
            {movie.actresses
              ? movie.actresses.length > 1
                ? "Cast(s)"
                : "Cast"
              : "Cast"}
          </p>
          <p className="javadoz-video-details-text actresses">
            {movie.actresses &&
              movie.actresses.length > 0 &&
              movie.actresses.map((actress) => (
                <button
                  key={actress.name}
                  className="actress-name-button"
                  onClick={() => onShowTrailer(actress)}
                >
                  {actress.name}
                </button>
              ))}
            {!movie.actresses && <span>N/A</span>}
            {/* {movie.actresses && movie.actresses.length > 0 &&
              movie.actresses.map((actress) => (
                <button
                  key={actress.name}
                  className="actress-name-button"
                  onClick={() => onShowTrailer(actress)}
                >
                  {actress.name}
                </button>
              ))} */}
            {/* {movie.actresses.length === 0 && <span>N/A</span>} */}
          </p>
        </div>
        {/* Genre */}
        <div className="javadoz-video-details-categories">
          <p className="javadoz-video-details-label">Genre:</p>
          <p className="javadoz-video-details-text">
            {movie.genres ? movie.genres.join(", ") : "N/A"}
          </p>
        </div>
        {/* Label */}
        <div className="javadoz-video-details-categories">
          <p className="javadoz-video-details-label">Studio:</p>
          <p className="javadoz-video-details-text">{movie.studio}</p>
        </div>

        {/* Duration */}
        <div className="javadoz-video-details-categories with-close">
          <div style={{ width: "100%" }}>
            <p className="javadoz-video-details-label">Duration:</p>
            <p className="javadoz-video-details-text">
              {movie.length.replace("min", " minutes")}
            </p>
          </div>
          <div onClick={setShowModal} className="close-modal-bottom">
            <span>Close</span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default MovieDetails;
