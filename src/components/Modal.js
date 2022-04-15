import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MovieDetails from "./MovieDetails";
import Trailers from "./Trailers";
import axios from "axios";
import { showError } from "./ToastHelper";
import LikedMovie from "./LikedMovie";
import { backdropVariants, modalVariants } from "./Animation";

dayjs.extend(relativeTime);

const Modal = ({
  showModal,
  setShowModal,
  movie,
  likedMovies,
  onAddToLikedMovie,
}) => {
  const modalContainerRef = useRef();
  const [selectedActress, setSelectedActress] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(movie);
  const showTrailerHandler = (actress) => {
    setSelectedActress(actress);
  };
  const onBackButtonHandler = () => {
    setSelectedActress(null);
  };

  const onCloseModalHandler = () => {
    setShowModal(false);
    setSelectedActress(null);
    setSelectedMovie(null);
  };

  const movieSelectedHandler = async (selectedTrailer) => {
    setSelectedActress(null);
    setIsLoading(true);
    setSelectedMovie(null);
    const trailerMovieReq = await axios.get(
      process.env.REACT_APP_HEROKU_SERVER +
        "api/get-movie-metadata/?movieId=" +
        selectedTrailer
    );
    const trailerMovie = trailerMovieReq.data;
    trailerMovie.movieId = trailerMovie.id;
    trailerMovie.thumbnail = trailerMovie.poster;
    if (!trailerMovie.trailer) {
      showError("No Trailer found for this movie, please refresh page");
      setSelectedMovie(null);
      setIsLoading(false);
      return;
    }
    setSelectedMovie(trailerMovie);
    setIsLoading(false);
  };

  const favoriteMovieSelectedHandler = async (selectedFavoriteMovie) => {
    setSelectedActress(null);
    setSelectedMovie(null);
    if (selectedFavoriteMovie.trailer) {
      setIsLoading(true);
      setTimeout(() => {
        setSelectedMovie(selectedFavoriteMovie);
      }, 500);
      modalContainerRef.current.scrollTo({
        top: -100,
        behavior: "smooth",
      });
      setIsLoading(false);
    } else {
      setIsLoading(true);
      const favoriteMovieReq = await axios.get(
        process.env.REACT_APP_HEROKU_SERVER +
          "api/get-movie-metadata/?movieId=" +
          selectedFavoriteMovie.movieId
      );
      const favoriteMovie = favoriteMovieReq.data;
      if (!selectedFavoriteMovie.trailer) {
        showError("No Trailer found for this movie, please refresh page");
        setSelectedMovie(null);
        setIsLoading(false);
        return;
      }
      modalContainerRef.current.scrollTo({
        top: -100,
        behavior: "smooth",
      });
      setSelectedMovie(favoriteMovie);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedActress(null);
    setSelectedMovie(movie);
  }, [movie, likedMovies]);
  return (
    <AnimatePresence exitBeforeEnter>
      {showModal && (
        <motion.div
          className="backdrop"
          variants={backdropVariants}
          animate="visible"
          initial="hidden"
          exit="hidden"
        >
          <motion.div
            variants={modalVariants}
            className="modal"
            ref={modalContainerRef}
          >
            <span
              title="Close"
              onClick={onCloseModalHandler}
              className="close-modal"
            >
              <FontAwesomeIcon className="close-icon" icon={["fas", "x"]} />
            </span>

            {/* Movie Details */}
            {isLoading && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
            {/*  Movie Details  */}
            <AnimatePresence exitBeforeEnter>
              {selectedMovie && !selectedActress && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: "100vw",
                    transition: { duration: 0.4 },
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: "-100vw",
                    transition: { duration: 0.4 },
                  }}
                >
                  <MovieDetails
                    movie={selectedMovie}
                    onShowTrailer={showTrailerHandler}
                    onAddToLikedMovie={(movie) => onAddToLikedMovie(movie)}
                    setShowModal={onCloseModalHandler}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Trailers */}
            <AnimatePresence exitBeforeEnter>
              {selectedActress && (
                <div className="trailer-wrapper">
                  <Trailers
                    onBackButton={onBackButtonHandler}
                    onMovieSelectedButton={(trailerMovie) =>
                      movieSelectedHandler(trailerMovie)
                    }
                    actress={selectedActress}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Liked Movies */}
            <AnimatePresence exitBeforeEnter>
              {likedMovies && likedMovies.length > 0 && !selectedActress && (
                <LikedMovie
                  likedMovies={likedMovies}
                  setShowModal={setShowModal}
                  onAddToLikedMovie={(movie) => onAddToLikedMovie(movie)}
                  onFavoriteMovieSelectedButton={(favoriteMovie) =>
                    favoriteMovieSelectedHandler(favoriteMovie)
                  }
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
