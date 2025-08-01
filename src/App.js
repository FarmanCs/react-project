import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovie } from "./useMovie";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "762f945d";

export default function App() {
  const [query, setQuery] = useState("");
  const { movies, isLoading, error } = useMovie(query, handleCloseMovie);
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [selectMovieId, setSelectMovieId] = useState();

  function handleSelectMovie(id) {
    setSelectMovieId((selecId) => (id === selecId ? null : id));
  }

  function handleCloseMovie() {
    setSelectMovieId(null);
  }

  function handlAddMoveWatched(movie) {
    setWatched((watch) => [...watch, movie]);
  }

  function handleDeleteMovie(id) {
    setWatched((curWatchedMove) =>
      curWatchedMove.filter((movie) => movie.imdbID !== id)
    );
  }

  return (
    <>
      <Navbar>
        <SearchBar query={query} setQuery={setQuery} />
        <NumberCountForNavbar movies={movies} />
      </Navbar>
      <MainSectionOfPage>
        <MoveBox>
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MoviesList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </MoveBox>
        <MoveBox>
          {selectMovieId ? (
            <MovieDetail
              selectMovieId={selectMovieId}
              onCloseMoive={handleCloseMovie}
              onAddWatchedMovie={handlAddMoveWatched}
              watched={watched}
            />
          ) : (
            <>
              <SummaryOfMovie watched={watched} />
              <WatchedMoviesList
                watched={watched}
                OnDeleteMovie={handleDeleteMovie}
              />
            </>
          )}
        </MoveBox>
      </MainSectionOfPage>
    </>
  );
}

function Loading() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🚩{message}</span>
    </p>
  );
}

function MainSectionOfPage({ children }) {
  return <main className="main">{children}</main>;
}

function MoveBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetail({
  selectMovieId,
  onCloseMoive,
  onAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countUserRating = useRef(0);

  useEffect(
    function () {
      if (userRating) countUserRating.current++;
    },
    [userRating]
  );

  const isMoviesWatched = watched
    .map((watch) => watch.imdbID)
    .includes(selectMovieId);
  // console.log(isMoviesWatched)

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Gener: gener,
    imdbRating,
  } = movie;

  // console.log(title, year, actors, runtime);
  // console.log(runtime.split(" ")[0]);

  function handleAddWatched() {
    const newMovieObj = {
      imdbID: selectMovieId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating,
      countRatingDecision: countUserRating.current,
    };
    onAddWatchedMovie(newMovieObj);
    onCloseMoive();
  }

  useKey("Escape", onCloseMoive);

  //this effecthook will show the move after each movie is either added or deleted to this box
  useEffect(
    function () {
      async function getMoviesDetail() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectMovieId}`
        );
        const data = await res.json();
        // console.log(data);
        setMovie(data);
        setIsLoading(false);
      }
      getMoviesDetail();
    },
    [selectMovieId]
  );

  useEffect(
    function () {
      if (!title) return; //safty check
      document.title = `Movie | ${title}`;

      //this is called clean up function which is runter after each mounting of effect. Simply say run after each effect close
      // return function(){
      //   document.title='Movie | '
      // }

      //same as above but with arrow function
      return () => (document.title = "Movie |");
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMoive}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} move`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{gener}</p>
              <p>
                🔅<span>{imdbRating} IMD Rating</span>
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isMoviesWatched ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={26}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddWatched}>
                      + add to list
                    </button>
                  )}
                </>
              ) : (
                <p>Movie already in the List</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function WatchedMoviesList({ watched, OnDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <h3>{movie.title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
            <button
              className="btn-delete"
              onClick={() => OnDeleteMovie(movie.imdbID)}
            >
              X
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SummaryOfMovie({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function NumberCountForNavbar({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Searh & Watch</h1>
    </div>
  );
}
