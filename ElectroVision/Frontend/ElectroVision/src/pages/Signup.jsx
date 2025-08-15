import React, { useState } from 'react';
import { Zap, User, Mail, Lock, Building } from 'lucide-react';
import './Signup.css';

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    idDocument: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: Math.random().toString(36).slice(2),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      approved: formData.role === 'policymaker' ? false : true
    };
    onSignup(newUser);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idDocument: e.target.files[0] });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Logo / Title */}
        <div className="auth-header">
          <div className="auth-logo">
            <Zap className="logo-icon" />
          </div>
          <h1 className="auth-title">ElectriPredict</h1>
          <p className="auth-subtitle">Electricity Demand Forecasting Platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
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
          <div className="input-group">
            <Building className="input-icon" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="role-select"
            >
              <option value="user">Regular User</option>
              <option value="government">Government Official</option>
              <option value="policymaker">Policy Maker</option>
            </select>
          </div>

          {formData.role === 'policymaker' && (
            <div className="file-upload">
              <label>Upload ID Document</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
              <p className="note">Required for policy maker approval</p>
            </div>
          )}

          <button type="submit" className="btn-submit">Sign Up</button>
        </form>

        {/* Demo Accounts */}
        <div className="demo-box">
          <h3>Demo Accounts:</h3>
          <div>Government: gov@demo.com</div>
          <div>Policy Maker: policy@demo.com</div>
          <div>User: user@demo.com</div>
          <div className="demo-pass">Password: demo123</div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
