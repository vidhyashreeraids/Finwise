import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import AIAdvisor from "./pages/AIAdvisor";
import Profile from "./pages/Profile";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* TRANSACTIONS */}
        <Route
          path="/transactions"
          element={<Transactions />}
        />

        {/* ANALYTICS */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* GOALS */}
        <Route
          path="/goals"
          element={<Goals />}
        />

        {/* AI ADVISOR */}
        <Route
          path="/ai"
          element={<AIAdvisor />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;