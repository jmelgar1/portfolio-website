import React from 'react';
import './App.css';
import ThreeJSBackground from './background/ThreeJSBackground';

function App() {
  return (
    <div className="App">
      <ThreeJSBackground lookAt={[0, 1.4, 0]} />
    </div>
  );
}

export default App;
