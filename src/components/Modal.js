import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    transition: {delay: 0.2}
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
            <motion.span
              title="Close"
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowModal(false)}
              className="close-modal"
            >
              <FontAwesomeIcon className="close-icon" icon={["fas", "x"]} />
            </motion.span>
            {/* <span className="" onClick={() => setShowModal(false)}>
              X
            </span> */}
            {isFetchingMetadata && (
              <div className="movie-wrapper">
                <Spinner />
              </div>
            )}
            {!isFetchingMetadata && movie && (
              <>
                <p className="modal-movie-id">{movie.title}</p>
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
                <div className="javadoz-video-details-container"></div>
                {/* Actresses */}
                {/* Genre */}
                {/* Label */}
                {/* Date Released */}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
