import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./Pages/Landing";
import Game from "./Pages/Game";

const App = () => {
  return (
    <div className="h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  );
};

export default App;
