import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
import MovieDetails from "./MovieDetails";
import Trailers from "./Trailers";

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
    transition: { delay: 0.2 },
  },
};
dayjs.extend(relativeTime);

const Modal = ({ showModal, setShowModal, movie, isFetchingMetadata }) => {
  const [trailers, setTrailers] = useState([]);
  const [isFetchingActress, setIsFetchingActress] = useState(false);
  const [selectedActress, setSelectedActress] = useState();
  const showTrailerHandler = (actress) => {
    setIsFetchingActress(true);
    setTimeout(() => {
      console.log(actress);
      setSelectedActress(actress);
      setIsFetchingActress(false);
      setTrailers(["1"]);
    }, 1000);
  };
  const onBackButtonhandler = () => {
    setTrailers([]);
  };

  useEffect(() => {
    setTrailers([]);
  }, []);
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
              onClick={() => setShowModal(false)}
              className="close-modal"
            >
              <FontAwesomeIcon className="close-icon" icon={["fas", "x"]} />
            </motion.span>

            {/* Movie Details */}
            {isFetchingMetadata && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
            <AnimatePresence exitBeforeEnter>
              {!isFetchingMetadata &&
                movie &&
                !isFetchingActress &&
                trailers.length === 0 && (
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
                      movie={movie}
                      onShowTrailer={showTrailerHandler}
                      setShowModal={() => setShowModal(false)}
                    />
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Actress Trailer Section */}
            {isFetchingActress && trailers.length === 0 && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
            <AnimatePresence exitBeforeEnter>
              {!isFetchingActress && trailers.length > 0 && (
                <div className="trailer-wrapper">
                  <Trailers
                    onBackButton={onBackButtonhandler}
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
