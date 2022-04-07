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

const Modal = ({ showModal, setShowModal, movie }) => {
  return (
    <AnimatePresence exitBeforeEnter>
      {showModal && (
        <motion.div
          onClick={() => setShowModal(false)}
          className="backdrop"
          variants={backdrop}
          animate="visible"
          initial="hidden"
          exit="hidden"
        >
          <motion.div variants={modal} className="modal">
            <p>{movie.id}</p>
            {/* Video Container */}
            {/* --------------------- */}
            {/* Movie Details Container */}
            {/* Actresses */}
            {/* Genre */}
            {/* Label */}
            {/* Date Released */}
            <div>
              {!movie.trailer && <h2>No Trailer Available</h2>}
              {movie.trailer && (
                <video className="javadoz-video" poster={movie.thumbnail} controls>
                  <source src={movie.trailer} type="video/mp4" />
                </video>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
