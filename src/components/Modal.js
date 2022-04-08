import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Spinner from "./Spinner";

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
    transition: { delay: 0.5 },
  },
};

const Modal = ({ showModal, setShowModal, movie, isFetchingMetadata }) => {
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
            <span className="close-modal" onClick={() => setShowModal(false)}>
              X
            </span>
            {isFetchingMetadata && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
            {!isFetchingMetadata && movie && (
              <>
                <p>{movie.movieId}</p>
                {/* Video Container */}
                {/* --------------------- */}
                {/* Movie Details Container */}
                {/* Actresses */}
                {/* Genre */}
                {/* Label */}
                {/* Date Released */}
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
