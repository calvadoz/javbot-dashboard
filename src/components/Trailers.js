import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import Spinner from "./Spinner";

const regExp = /\(([^)]+)\)/;
const Trailers = ({ actress, onBackButton, onMovieSelectedButton }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [actressDetails, setActressDetails] = useState({});

  const fetchActressDetails = useCallback(async () => {
    let name = actress.name.includes("(")
      ? actress.name.match(regExp)[1].toLowerCase().split(" ").join("-")
      : actress.name.toLowerCase().split(" ").join("-");
    let url = encodeURIComponent(actress.actressUrl);
    const actressDetailsReq = await axios.get(
      process.env.REACT_APP_HEROKU_SERVER +
        `api/get-actress-details/?name=${name}&url=${url}`
    );
    const actressDetailsData = await actressDetailsReq.data;
    setActressDetails(actressDetailsData);
    setIsLoading(false);
  }, [actress]);

  useEffect(() => {
    fetchActressDetails();
  }, [fetchActressDetails]);

  return (
    <>
      {isLoading && (
        <div className="movie-wrapper">
          <Spinner />
        </div>
      )}
      {!isLoading && (
        <>
          <p className="modal-movie-id">
            <span onClick={onBackButton}>
              <FontAwesomeIcon
                style={{ marginRight: "12px", cursor: "pointer" }}
                icon={["fas", "arrow-left-long"]}
              />
            </span>
            <span style={{ fontWeight: "normal" }} title={actress.name}>
              {actress.name}
            </span>
          </p>
          <div className="actress-bio">
            <img src={actressDetails.photo} alt="actress" />
            <div className="actress-bio-details-wrapper">
              <p className="actress-label-text">
                D.O.B:{" "}
                <span className="actress-text">
                  {actressDetails.dob} ( {dayjs(actressDetails.dob).fromNow(true)}{" "}
                  old)
                </span>
              </p>
              <p className="actress-label-text">
                Cup: <span className="actress-text">{actressDetails.cup}</span>
              </p>
              <p className="actress-label-text">
                Height:{" "}
                <span className="actress-text">{actressDetails.height}</span>
              </p>
              <p className="actress-label-text">
                Measurement:{" "}
                <span className="actress-text">
                  {actressDetails.measurement}
                </span>
              </p>
              <p className="actress-label-text">
                Body Types:{" "}
                <span className="actress-text">
                  {actressDetails.bodyTypes.join(", ")}
                </span>
              </p>
              <p className="actress-label-text">
                Twitter:{" "}
                <span className="actress-text">{actressDetails.twitter}</span>
              </p>
            </div>
          </div>
          <p className="recent-movies">
            Recent {actressDetails.trailers.length} movies
          </p>
          <div className="trailer-gallery">
            {actressDetails.trailers.length > 0 &&
              actressDetails.trailers.map((detail) => (
                <motion.div
                  onClick={() => onMovieSelectedButton(detail.id)}
                  whileHover={{ scale: 1.1 }}
                  className="movie-thumbnail-wrapper"
                  key={detail.id}
                >
                  <img src={detail.thumbnail} alt="thumbnail" />
                  <span className="movie-code">{detail.id}</span>
                </motion.div>
              ))}
          </div>
        </>
      )}
    </>
  );
};

export default Trailers;
