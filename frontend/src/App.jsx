
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import RewindStagePage from "./pages/RewindStagePage.jsx";
import GamesMenuPage from "./pages/GameMenuPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";


function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />}/>
              <Route path="/games-menu" element={<GamesMenuPage />} />
              <Route path="/rewind-stage/:gameId" element={<RewindStagePage />} />
          </Routes>
      </BrowserRouter>
  );
}


export default App
