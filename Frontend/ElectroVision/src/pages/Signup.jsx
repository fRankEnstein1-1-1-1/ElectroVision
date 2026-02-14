import { useState, useEffect } from 'react'; // Import useEffect
import axios from "axios";
import { Zap, User, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();

  // --- ADD THIS EFFECT TO RESTORE THEME ---
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    const root = document.documentElement;
    root.setAttribute("data-theme", storedTheme);
    if (storedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullname || !email || !password) {
      alert("Please enter all details!");
      return;
    }
    
    axios.post('http://localhost:5000/api/v1/user/sign', { fullname, email, password })
      .then(() => {
        alert("User Signed Successfully!");
        navigate('/Home');
      })
      .catch((error) => {
        alert("Couldn't sign you up!");
        console.error(error);
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-logo">
            <Zap className="logo-icon" />
          </div>
          <h1 className="auth-title">ElectroVision</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Sign Up
          </button>

          <div className="link-container">
            <Link to="/Login" className="auth-link">
              Already have an account? Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;