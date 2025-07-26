import { useEffect, useState } from "react";
const KEY = "762f945d";

export function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  //useEffect hook when we try to search for move so it will give us the new result, this hook will show it on UI after each key stroke
  useEffect(
    function () {
      // callBack?.();

      const controller = new AbortController();
      async function fetchMove() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Something went wrong✈");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Move not found");
          setMovies(data.Search);
          setError("");
          // setQuery("");
          // console.log(data.Search);
        } catch (error) {
          if (error.name !== "AbortError") {
            setError(error.message);
          }
          console.error(error.message);
        } finally {
          setIsLoading(false); //the finaly statment or code is always be executed....
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMove();

      //this is called cleaning up after doing the taske
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { error, movies, isLoading };
}
