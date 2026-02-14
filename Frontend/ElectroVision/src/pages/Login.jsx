import React, { useState, useEffect } from 'react'; // Import useEffect
import { Zap, Mail, Lock, FileKey } from 'lucide-react';
import axios from "axios";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Auth.css'; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || ""; 
  
  // --- ADD THIS EFFECT TO RESTORE THEME ---
  useEffect(() => {
    // 1. Get theme from storage
    const storedTheme = localStorage.getItem("theme") || "light";
    
    // 2. Apply it to the document
    const root = document.documentElement;
    root.setAttribute("data-theme", storedTheme);
    if (storedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []); // Run once on mount

  const [reqid, setReqid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { email, password };
    if(role === "Policy Maker") payload.reqid = reqid;

    axios.post('http://localhost:5000/api/v1/user/login', payload)
      .then(() => {
        alert("Login successful!");
        navigate('/Home'); // Make sure path is correct
      })
      .catch((error) => {
        alert("Can't log you in. Please check credentials.");
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
          <p className="auth-subtitle">Electricity Demand Forecasting</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          {role === "Policy Maker" && (
            <div className="input-group">
              <FileKey className="input-icon" />
              <input
                type="text"
                placeholder="Request ID"
                value={reqid}
                onChange={(e) => setReqid(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn-submit">
            Log In
          </button>

          <div className="link-container">
            <Link to="/signup" className="auth-link">
              New user? Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;