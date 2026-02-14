import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home"; // 1. Import Home

function App() {
  const handleLogin = (user) => console.log("Logged in:", user);
  const handleSignup = (user) => console.log("Signed up:", user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        
        {/* 2. Add the Route for Home */}
        {/* Make sure the path matches exactly what you wrote in navigate("/Home") */}
        <Route path="/Home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;