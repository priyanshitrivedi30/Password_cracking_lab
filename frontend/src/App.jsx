// App.jsx
// Route structure:
//   PUBLIC  (no auth): /welcome, /login, /register
//   PRIVATE (auth):    /overview, /labinfo, /lab, /analytics, /leaderboard, /result
//
// Flow per spec:
//   / or unknown → /welcome (public landing)
//   login success → /overview (step 1, dashboard)
//   register success → /overview

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Welcome     from "./pages/welcome";
import Login       from "./pages/login";
import Register    from "./pages/register";
import Overview    from "./pages/overview";
import LabInfo     from "./pages/labinfo";
import Lab         from "./pages/lab";
import Analytics   from "./pages/analytics";
import Leaderboard from "./pages/leaderboard";
import Result      from "./pages/result";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/welcome"  element={<Welcome />} />
        <Route path="/login"    element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />

        {/* ── Protected routes ── */}
        <Route path="/overview"    element={token ? <Overview />    : <Navigate to="/login" replace />} />
        <Route path="/labinfo"     element={token ? <LabInfo />     : <Navigate to="/login" replace />} />
        <Route path="/lab"         element={token ? <Lab />         : <Navigate to="/login" replace />} />
        <Route path="/analytics"   element={token ? <Analytics />   : <Navigate to="/login" replace />} />
        <Route path="/leaderboard" element={token ? <Leaderboard /> : <Navigate to="/login" replace />} />
        <Route path="/result"      element={token ? <Result />      : <Navigate to="/login" replace />} />

        {/* ── Catch-all ── */}
        {/* Logged in → overview (step 1/dashboard). Not logged in → public welcome page */}
        <Route
          path="*"
          element={token ? <Navigate to="/overview" replace /> : <Navigate to="/welcome" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;