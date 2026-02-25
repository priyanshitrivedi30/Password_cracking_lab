import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/login";
import Register from "./pages/register";
import Overview from "./pages/overview";
import LabInfo from "./pages/labinfo";
import Lab from "./pages/lab";
import Analytics from "./pages/analytics";
import Leaderboard from "./pages/leaderboard";
import Navbar from "./components/navbar";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <BrowserRouter>
      {!token ? (
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      ) : (
        <>
          <Navbar />
          <Routes>
            {/* ✅ Optional learning page */}
            <Route path="/overview" element={<Overview />} />

            {/* ✅ Mandatory disclaimer + difficulty */}
            <Route path="/labinfo" element={<LabInfo />} />

            {/* ✅ Actual lab */}
            <Route path="/lab" element={<Lab />} />

            <Route path="/analytics" element={<Analytics />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;