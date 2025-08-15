import React, { useState } from 'react';
import { Zap, Mail, Lock } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      id: Math.random().toString(36).slice(2),
      name: 'Demo User',
      email: formData.email,
      role: 'user',
      approved: true
    };
    onLogin(user);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Logo */}
        <div className="auth-header">
          <div className="auth-logo">
            <Zap className="logo-icon" />
          </div>
          <h1>ElectroVision</h1>
          <p>Electricity Demand Forecasting Platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            Sign In
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="demo-box">
          <h3>Demo Accounts:</h3>
          <p>Government: gov@demo.com</p>
          <p>Policy Maker: policy@demo.com</p>
          <p>User: user@demo.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
