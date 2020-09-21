import React, { useState } from "react";
import ContextComponent from "./context-component";
import _throttle from "./throttle";
import _debounce from "./debounce";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [throttleCount, setThrottleCount] = useState(0);
  const throttledCounter = _throttle(() => {
    setThrottleCount(throttleCount + 1);
  }, 2000);

  const [debounceCount, setDebounceCount] = useState(0);
  const debouncedCounter = _debounce(() => {
    setDebounceCount(debounceCount + 1);
  }, 2000);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="App-link">Throttle Counter: {throttleCount}</div>
        <br />
        <button onClick={throttledCounter}>Throttle Click</button>
        <br />
        <div className="App-link">Debounce Counter: {debounceCount}</div>
        <button onClick={debouncedCounter}>Debounce Click</button>
        <ContextComponent />
      </header>
    </div>
  );
}

export default App;
