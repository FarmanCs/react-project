import { useState, useEffect } from "react";

export function useLocalStorageState(initialStat, key) {
  const [value, setValue] = useState(function () {
    const localStoredValue = localStorage.getItem(key);
    return localStoredValue ? JSON.parse(localStoredValue) : initialStat;
  });

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value));
    },
    [value]
  );

  return [value, setValue];
}
