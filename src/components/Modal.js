import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MovieDetails from "./MovieDetails";
import Trailers from "./Trailers";
import axios from "axios";

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: {
    y: "-100vh",
    opacity: 0,
  },
  visible: {
    y: "200px",
    opacity: 1,
  },
};
dayjs.extend(relativeTime);

const Modal = ({ showModal, setShowModal, movie }) => {
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
    setSelectedMovie(trailerMovie);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("Selected Movie: ", movie);
    setSelectedActress(null);
    setSelectedMovie(movie);
  }, [movie]);
  return (
    <AnimatePresence exitBeforeEnter>
      {showModal && (
        <motion.div
          className="backdrop"
          variants={backdrop}
          animate="visible"
          initial="hidden"
          exit="hidden"
        >
          <motion.div variants={modal} className="modal">
            <motion.span
              title="Close"
              whileHover={{ scale: 1.1 }}
              onClick={onCloseModalHandler}
              className="close-modal"
            >
              <FontAwesomeIcon className="close-icon" icon={["fas", "x"]} />
            </motion.span>

            {/* Movie Details */}
            {isLoading && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
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
                    setShowModal={onCloseModalHandler}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
