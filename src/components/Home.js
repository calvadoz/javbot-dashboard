import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { orderBy, filter, uniqBy } from "lodash";
import React, { useState, useEffect, useRef, useCallback } from "react";
import logo from "./../assets/logo-split-only.svg";
import imageNotFound from "./../assets/image-not-found.png";
import Modal from "./Modal";
import Spinner from "./Spinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  get,
  onChildAdded,
  onChildChanged,
  orderByKey,
  query,
  child,
  limitToFirst,
  startAt,
  limitToLast,
} from "firebase/database";
import { ToastContainer } from "react-toastify";
import { showInfo } from "./ToastHelper";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // The value of databaseURL depends on the location of the database
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // For Firebase JavaScript SDK v7.20.0 and later, measurementId is an optional field
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
initializeApp(firebaseConfig);
const db = getDatabase();
const javMoviesR18 = query(ref(db, "jav-movies-r18"));
const javMoviesR18Last = query(ref(db, "jav-movies-r18"), limitToLast(1));
const Home = () => {
  const searchInput = useRef();
  const [allMovies, setAllMovies] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverVersion, setServerVersion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState();
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const appendMetadata = (data) => {
    const movies = [];
    for (const key in data) {
      const movie = {};
      movie.movieId = data[key].movieId;
      movie.requester = data[key].requester;
      movie.timestamp = data[key].timestamp;
      movie.thumbnail = data[key].thumbnail ? data[key].thumbnail : null;
      movie.trailer = data[key].trailer ? data[key].trailer : null;
      movies.push(movie);
    }
    return movies;
  };

  const searchHandler = (e) => {
    if (e.key === "Enter") {
      filterMovies(searchInput.current.value);
    }
  };

  const blurSearchHandler = (e) => {
    filterMovies(searchInput.current.value);
  };

  const filterMovies = (searchText) => {
    const clonedMovies = [...allMovies];
    if (!searchText.trim()) {
      setFilteredMovies([...clonedMovies]);
      return;
    }
    const filteredMovies = clonedMovies.filter((movie) =>
      movie.movieId.toLowerCase().includes(searchText.trim().toLowerCase())
    );
    setFilteredMovies(filteredMovies);
    searchInput.current.focus();
  };

  const viewMovieDetails = async (movie) => {
    setShowModal(true);
    setIsFetchingMetadata(true);
    const movieDetailsReq = await axios.get(
      process.env.REACT_APP_HEROKU_SERVER +
        "api/get-movie-metadata?movieId=" +
        movie.movieId
    );
    const movieDetails = await movieDetailsReq.data;
    movieDetails.trailer = movie.trailer;
    movieDetails.thumbnail = movie.thumbnail;
    movieDetails.requester = movie.requester;
    movieDetails.timestamp = movie.timestamp;
    setIsFetchingMetadata(false);
    setSelectedMovie(movieDetails);
  };

  const getServerVersion = useCallback(async () => {
    const serverVersionReq = await axios.get(
      process.env.REACT_APP_HEROKU_SERVER + "api/get-version"
    );
    let sVersion = serverVersionReq.data;

    sVersion =
      sVersion === "development"
        ? sVersion
        : process.env.REACT_APP_SERVER_VERSION.replace(
            "x",
            sVersion.replace("v", "")
          );
    setServerVersion(sVersion);
  }, []);

  useEffect(() => {
    searchInput.current.value = "";
    setIsLoading(true);
    get(javMoviesR18)
      .then((snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          const movieData = [...appendMetadata(snapshot.val())];
          // order by timestamp recent
          let orderedByNewestMovies = orderBy(
            movieData,
            ["timestamp"],
            ["desc"]
          );
          orderedByNewestMovies = filter(
            orderedByNewestMovies,
            (movie) => movie.thumbnail
          );
          orderedByNewestMovies = uniqBy(orderedByNewestMovies, "movieId");
          setAllMovies(orderedByNewestMovies);
          setFilteredMovies(orderedByNewestMovies);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        setHasError(true);
        console.error(error);
      });

    onChildAdded(javMoviesR18, (snapshot, prevChildKey) => {
      if (snapshot.exists()) {
        const newMovie = snapshot.val();

        if (newMovie.thumbnail) {
          setAllMovies((oldArray) => [newMovie, ...oldArray]);
          setFilteredMovies((oldArray) => [newMovie, ...oldArray]);
        }
      }
    });
    onChildAdded(javMoviesR18Last, (snapshot) => {
      if (snapshot.exists()) {
        const newMovie = snapshot.val();
        const renderElement = (
          <div>
            Latest Movie: <b>{newMovie.movieId}</b>
            <br />
            Requested by: <b>{newMovie.requester.split("#")[0]}</b>
          </div>
        );
        showInfo(renderElement);
      }
    });
  }, []);

  return (
    <React.Fragment>
      <div className="main-container">
        <ToastContainer limit={2} />
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          isFetchingMetadata={isFetchingMetadata}
          movie={selectedMovie}
        />

        <header className="header">
          <img
            title="Feel the Eccentric"
            src={logo}
            alt="logo"
            style={{ cursor: "pointer" }}
          />
        </header>
        <main className="main">
          <div className="input-wrapper">
            <input
              autoFocus
              placeholder="Movie Code"
              className="search-text"
              onKeyDown={searchHandler}
              onBlur={blurSearchHandler}
              ref={searchInput}
            />
          </div>
          <div className="movie-wrapper">
            {isLoading && <Spinner />}
            {!isLoading && hasError && (
              <h2>
                Something went wrong, please check your internet connection...
              </h2>
            )}
            {!isLoading &&
              filteredMovies.map((movie, index) => (
                <motion.div
                  layout="position"
                  // whileHover={{ scale: 1.05, originX: 0, originY: 0 }}
                  initial={{ opacity: 0, x: -50, y: -50 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    transition: { delay: index * 0.05 },
                  }}
                  key={movie.movieId + index}
                  className="movie-details"
                >
                  <div className="movie-card">
                    <motion.img
                      whileHover={{ scale: 1.02, originX: 0, originY: 0 }}
                      onClick={() => viewMovieDetails(movie)}
                      className="movie-cover"
                      src={movie.thumbnail ? movie.thumbnail : imageNotFound}
                      alt="cover"
                    />
                    <div className="action-bar">
                      <div className="title-container">
                        {movie.movieId} - {movie.requester.split("#")[0]}
                      </div>
                      <div className="button-container">
                        <motion.span
                          title="Watch Movie"
                          className="button-icon"
                        >
                          <FontAwesomeIcon
                            className="watch-movie"
                            icon={["fas", "tv"]}
                          />
                        </motion.span>
                        <span title="Like Movie" className="button-icon">
                          <FontAwesomeIcon
                            className="like-movie liked"
                            icon={["fas", "heart"]}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </main>
        <footer className="footer"></footer>
      </div>
    </React.Fragment>
  );
};

export default Home;
