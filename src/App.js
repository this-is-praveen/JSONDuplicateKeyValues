import React, { useEffect, useState } from "react";
import DuplicateKeyIdFinder from "./DuplicateKeyIdFinder";
import "./styles.css";

export const getDefaultTheme = () =>
  window?.matchMedia?.("(prefers-color-scheme: dark)").matches;

export default function App() {
  const isDark = getDefaultTheme();
  const [theme, setTheme] = useState(isDark ? "dark" : "light");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return (
    <div className="App">
      <div className="line" />
      <div className="line" />
      <div className="line" />
      <DuplicateKeyIdFinder theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
