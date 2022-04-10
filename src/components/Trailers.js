import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React, { useState } from "react";

const Trailers = ({ actress, onBackButton }) => {
  return (
    <p className="modal-movie-id">
      <span onClick={onBackButton}>
        <FontAwesomeIcon
          style={{ marginRight: "12px", cursor: "pointer" }}
          icon={["fas", "arrow-left-long"]}
        />
      </span>
      <span
        style={{ fontWeight: "normal" }}
        title={actress.name}
      >
        {actress.name}
      </span>
      {/* {movie.id} -{" "}
      <span
        style={{ fontSize: "80%", fontWeight: "normal" }}
        title={movie.releaseDate}
      >
        {dayjs().to(dayjs(movie.releaseDate))}
      </span> */}
    </p>
  );
};

export default Trailers;
