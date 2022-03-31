import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { orderBy } from "lodash";
import React, { useState, useEffect, useRef } from "react";
import logo from "./../assets/logo.png";
import Spinner from "./Spinner";

const Home = () => {
  const searchInput = useRef();
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchMovies = async () => {
    setIsLoading(true);
    const movies = await axios.get(process.env.REACT_APP_HEROKU_SERVER);
    setIsLoading(false);
    const orderedByNewestMovies = orderBy(movies.data, ["timestamp"], ["desc"]);
    console.log(orderedByNewestMovies);
    setAllMovies(orderedByNewestMovies);
    setFilteredMovies(orderedByNewestMovies);
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
      movie.id.toLowerCase().includes(searchText.trim().toLowerCase())
    );
    setFilteredMovies(filteredMovies);
    searchInput.current.focus();
  };

  useEffect(() => {
    searchInput.current.value = "";
    fetchMovies();
  }, []);

  return (
    <React.Fragment>
      <div className="main-container">
        <header className="header">
          <img src={logo} alt="logo" style={{ width: 200, height: 200 }} />
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
            {!isLoading &&
              filteredMovies.map((movie, index) => (
                <motion.div
                  layout
                  whileHover={{ scale: 1.05, originX: 0, originY: 0 }}
                  initial={{ opacity: 0, x: -50, y: -50 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    transition: { delay: index * 0.1 },
                  }}
                  key={movie.id}
                  className="movie-details"
                >
                  <div className="movie-card">
                    <img
                      className="movie-cover"
                      src={`data:image/png;base64, ${movie.base64thumb}`}
                      alt="cover"
                    />
                    <span className="movie-id">
                      {movie.id} - {movie.requester.split("#")[0]}
                    </span>
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
