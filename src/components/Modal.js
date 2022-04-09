import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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
  console.log(movie);
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

            {isFetchingMetadata && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
            {!isFetchingMetadata && movie && (
              <>
                <p className="modal-movie-id">
                  {movie.movieId} -{" "}
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
                    <video
                      className="javadoz-video"
                      poster={movie.thumbnail}
                      controls
                    >
                      <source src={movie.trailer} type="video/mp4" />
                    </video>
                  )}
                </div>
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
                      {movie.actresses.length > 1 ? "Casts" : "Cast"}
                    </p>
                    <p className="javadoz-video-details-text">
                      {movie.actresses ? movie.actresses : "N/A"}
                    </p>
                  </div>
                  {/* Genre */}
                  <div className="javadoz-video-details-categories">
                    <p className="javadoz-video-details-label">Genre:</p>
                    <p className="javadoz-video-details-text">
                      {movie.genre ? movie.genre.join(", ") : "N/A"}
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
                    <div
                      onClick={() => setShowModal(false)}
                      className="close-modal-bottom"
                    >
                      <span>Close</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
