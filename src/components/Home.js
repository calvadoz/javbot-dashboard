import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { orderBy, filter, uniqBy, map, uniq, includes } from "lodash";
import React, { useState, useEffect, useRef, useCallback } from "react";
import logo from "./../assets/logo-joined-only.svg";
import imageNotFound from "./../assets/image-not-found.png";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  onChildAdded,
  query,
  child,
  equalTo,
  limitToFirst,
  limitToLast,
  set,
  update,
  onChildChanged,
} from "firebase/database";
import { ToastContainer } from "react-toastify";
import { showError, showInfo } from "./ToastHelper";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

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
const dbRef = ref(getDatabase());
const db = getDatabase();
const javMoviesR18 = query(ref(db, "jav-movies-database"));
const javMoviesR18Last = query(ref(db, "jav-movies-database"), limitToLast(1));

const favMoviesInLocalStorage = localStorage.getItem("favMovies")
  ? JSON.parse(localStorage.getItem("favMovies"))
  : undefined;
if (!favMoviesInLocalStorage) {
  localStorage.setItem("favMovies", JSON.stringify([]));
}
const Home = () => {
  const searchInput = useRef();
  const [allMovies, setAllMovies] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverVersion, setServerVersion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState();
  const [errorMsg, setErrorMsg] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [genresFilter, setGenresFilter] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);

  const appendMetadata = (data) => {
    const movies = [];
    const favMovies = JSON.parse(localStorage.getItem("favMovies"));
    for (const key in data) {
      const movie = {};
      movie.firebaseId = key;
      movie.guid = data[key].guid;
      movie.movieId = data[key].movieId;
      movie.requester = data[key].requester;
      movie.timestamp = data[key].timestamp;
      movie.thumbnail = data[key].thumbnail ? data[key].thumbnail : null;
      movie.trailer = data[key].trailer ? data[key].trailer : null;
      movie.watchCount = data[key].watchCount;
      movie.actresses = data[key].actresses;
      movie.genres = data[key].genres;
      movie.studio = data[key].studio;
      movie.title = data[key].title;
      movie.length = data[key].length;
      movie.releaseDate = data[key].releaseDate;
      movie.isFavorite = false;
      if (favMovies.length > 0) {
        if (
          favMovies.findIndex(
            (favMovie) => favMovie.movieId === movie.movieId
          ) !== -1
        ) {
          movie.isFavorite = true;
        }
      }
      movies.push(movie);
    }
    return movies;
  };

  const searchHandler = async (e) => {
    setHasError(false);
    if (e.key === "Enter") {
      setIsLoading(true);
      setFilteredMovies([]);
      if (searchInput.current.value) {
        try {
          const r18MovieReq = await axios.get(
            process.env.REACT_APP_HEROKU_SERVER +
              "api/get-movie-metadata/?movieId=" +
              searchInput.current.value
          );
          const r18Movie = await r18MovieReq.data;
          const res = await axios.get("https://geolocation-db.com/json/");
          setIsLoading(false);
          if (!r18Movie.title) {
            setHasError(true);
            showError(
              "No record found or movie does not have trailer / thumbnail"
            );
            setErrorMsg("Please clear search result or search again");
            return;
          }
          r18Movie.requester = "R18";
          r18Movie.watchCount = 0;
          r18Movie.thumbnail = r18Movie.poster;
          r18Movie.movieId = r18Movie.id;
          delete r18Movie.poster;
          delete r18Movie.id;
          setSelectedMovie(r18Movie);
          setFilteredMovies([r18Movie]);
          set(ref(db, "jav-movie-search/" + uuidv4()), {
            movieId: r18Movie.movieId,
            timestamps: new Date().toString(),
            clientAddress: res.data.IPv4,
          });
        } catch (e) {
          setIsLoading(false);
          setHasError(true);
          showError(
            "No record found or movie does not have trailer / thumbnail"
          );
          setErrorMsg("Please clear search result or search again");
        }
      } else {
        filterMovies(searchInput.current.value);
        setIsLoading(false);
      }
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
    if (movie.firebaseId) {
      updateWatchCount(movie);
    }
    setShowModal(true);
    setSelectedMovie(movie);
    setLikedMovies([]);
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

  const updateWatchCount = (movie) => {
    get(child(dbRef, `jav-movies-database/${movie.firebaseId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const updatedData = { ...snapshot.val() };
          updatedData.watchCount++;
          update(
            child(dbRef, `jav-movies-database/${movie.firebaseId}`),
            updatedData
          );
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
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
        showError(
          "Something went wrong, please check your internet connection..."
        );
        // setErrorMsg(
        //   "Something went wrong, please check your internet connection..."
        // );
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
        if (newMovie.trailer) {
          showInfo(renderElement);
          setAllMovies((oldArray) => {
            oldArray.find(
              (oldRecord) => oldRecord.guid === newMovie.guid
            ).firebaseId = snapshot.key;
            return [...oldArray];
          });
          setFilteredMovies((oldArray) => {
            oldArray.find(
              (oldRecord) => oldRecord.guid === newMovie.guid
            ).firebaseId = snapshot.key;
            return [...oldArray];
          });
        }
      }
    });
    onChildChanged(javMoviesR18, (snapshot, prevChildKey) => {
      if (snapshot.exists()) {
        const newMovie = snapshot.val();
        setAllMovies((oldArray) => {
          oldArray.find(
            (oldRecord) => oldRecord.guid === newMovie.guid
          ).watchCount = newMovie.watchCount;
          return [...oldArray];
        });
        setFilteredMovies((oldArray) => {
          oldArray.find(
            (oldRecord) => oldRecord.guid === newMovie.guid
          ).watchCount = newMovie.watchCount;
          return [...oldArray];
        });
      }
    });
  }, []);

  const setupFilter = () => {
    const mappedMovies = map(filteredMovies, "genres").join().split(",");
    const uniqueGenres = uniq(mappedMovies);

    const genreList = [];
    uniqueGenres.forEach((genre) => {
      const movieCount = filter(filteredMovies, (b) =>
        includes(b.genres, genre)
      ).length;
      genreList.push({ genre, movieCount });
    });

    const filteredGenres = filter(genreList, (g) => !g.genre.includes("SALE"));
    const orderedGenres = orderBy(
      filteredGenres,
      ["movieCount", "genre"],
      ["desc", "asc"]
    );
    setGenresFilter(orderedGenres);
  };

  const filterHandler = (e) => {
    e.stopPropagation();
    setShowFilter(!showFilter);
  };

  const likeMovieHandler = (movie) => {
    const favMovies = localStorage.getItem("favMovies");
    let favMoviesJSON;
    if (favMovies) favMoviesJSON = JSON.parse(favMovies);

    if (
      favMoviesJSON.findIndex(
        (favMovie) => favMovie.movieId === movie.movieId
      ) === -1
    ) {
      favMoviesJSON.push(movie);
      localStorage.setItem("favMovies", JSON.stringify(favMoviesJSON));
      setAllMovies((oldArray) => {
        oldArray.find(
          (oldRecord) => oldRecord.guid === movie.guid
        ).isFavorite = true;
        return [...oldArray];
      });
      setFilteredMovies((oldArray) => {
        oldArray.find(
          (oldRecord) => oldRecord.guid === movie.guid
        ).isFavorite = true;
        return [...oldArray];
      });
    } else {
      const favMoviesFiltered = favMoviesJSON.filter(
        (favMovie) => favMovie.movieId !== movie.movieId
      );
      localStorage.setItem("favMovies", JSON.stringify(favMoviesFiltered));
      setAllMovies((oldArray) => {
        oldArray.find(
          (oldRecord) => oldRecord.guid === movie.guid
        ).isFavorite = false;
        return [...oldArray];
      });
      setFilteredMovies((oldArray) => {
        oldArray.find(
          (oldRecord) => oldRecord.guid === movie.guid
        ).isFavorite = false;
        return [...oldArray];
      });
    }
  };

  const genreFilterClickHandler = (genre) => {
    const isGenreExist = selectedGenre.findIndex((g) => g === genre) !== -1;
    if (isGenreExist) {
      const removeSelectedGenre = selectedGenre.filter((g) => g !== genre);
      setSelectedGenre(removeSelectedGenre);
      setFilteredMovies([...allMovies]);
    } else {
      // multiple filter
      // setSelectedGenre(prevGenre => [...prevGenre, genre]); allow multiple select
      // const test = filter(bokeps, (m) => {
      //   for (const genre of selectedGenres) {
      //     if (m.genres.includes(genre)) {
      //       return true;
      //     }
      //   }
      // });
      const filteredMovieWithGenre = filter(allMovies, (movie) =>
        movie.genres.includes(genre)
      );
      setFilteredMovies([...filteredMovieWithGenre]);
      setSelectedGenre([genre]);
    }
    setShowFilter(!showFilter);
  };

  const watchListHandler = () => {
    const localStorageFavMovies = localStorage.getItem("favMovies");
    if (
      !localStorageFavMovies ||
      JSON.parse(localStorageFavMovies).length === 0
    ) {
      alert("Liked movie list are empty");
      return;
    }
    const likedMovies = JSON.parse(localStorageFavMovies);
    setShowModal(true);
    setSelectedMovie(null);
    setLikedMovies(likedMovies);
  };

  const getSelectedGenreClass = (genre) => {
    return selectedGenre.findIndex((g) => g === genre) !== -1;
  };

  const onMainContainerClick = (e) => {
    setShowFilter(false);
  };

  const closeLikeMovieHandler = () => {
    console.log("Closing liked movie");
  };

  if (genresFilter.length === 0 && !isLoading) {
    setupFilter();
  }

  return (
    <React.Fragment>
      <div className="main-container" onClick={onMainContainerClick}>
        <ToastContainer limit={2} />
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          movie={selectedMovie}
          likedMovies={likedMovies}
          onCloseLikedMovieModal={closeLikeMovieHandler}
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
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              autoFocus
              placeholder="Search R18"
              className="search-text"
              onKeyDown={searchHandler}
              ref={searchInput}
            />
          </div>
          <div className="header-action-button">
            {" "}
            <button
              title="Filter Results by Genre"
              className={`header-button ${
                selectedGenre.length > 0 ? "genre" : ""
              }`}
              onClick={filterHandler}
            >
              {selectedGenre.length === 0 && (
                <span>
                  <FontAwesomeIcon
                    className="filter-icon"
                    icon={["fas", "filter"]}
                  />
                </span>
              )}
              {selectedGenre.length > 0 && selectedGenre.toString()}
            </button>
            <motion.button
              title="Watch List"
              className="header-button"
              onClick={() => watchListHandler()}
            >
              <span>
                <FontAwesomeIcon
                  className="sort-icon"
                  icon={["fas", "heart"]}
                />
              </span>
            </motion.button>
            <motion.button title="Settings" className="header-button">
              <span>
                <FontAwesomeIcon
                  className="setting-icon"
                  icon={["fas", "gear"]}
                />
              </span>
            </motion.button>
          </div>

          <div className="movie-wrapper">
            {isLoading && <Spinner />}
            {!isLoading && hasError && <h2>{errorMsg}</h2>}
            {showFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="filter-floating-menu"
              >
                {genresFilter.map((genre) => (
                  <button
                    key={genre.genre}
                    onClick={() => genreFilterClickHandler(genre.genre)}
                    className={
                      getSelectedGenreClass(genre.genre)
                        ? "genre active"
                        : "genre"
                    }
                  >
                    {genre.genre} ( {genre.movieCount} )
                  </button>
                ))}
              </motion.div>
            )}
            {!isLoading &&
              filteredMovies.map((movie, index) => (
                <motion.div
                  layout="position"
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
                          <span style={{ marginRight: 8 }}>
                            {movie.watchCount}
                          </span>
                          <FontAwesomeIcon
                            className="watch-movie"
                            icon={["fas", "eye"]}
                          />
                        </motion.span>
                        <span
                          title="Like Movie"
                          className="button-icon"
                          onClick={() => likeMovieHandler(movie)}
                        >
                          <FontAwesomeIcon
                            className={`like-movie ${
                              movie.isFavorite ? "liked" : ""
                            }`}
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
