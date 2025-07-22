import React from "react";
import "./App.css";
import SpaceBackground from "./background/SpaceBackground";

function App() {
  return (
    <div className="App">
      <SpaceBackground lookAt={[0, 1.4, 0]} />
    </div>
  );
}

export default App;
