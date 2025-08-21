import React, { useState } from 'react';
import { Zap, Mail, Lock } from 'lucide-react';
import './Login.css';
import { useNavigate ,Link, useLocation} from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const role = location.state?.role;
  console.log(`iam role and i reached login my name is ${role}`)
const navigate = useNavigate();

  const [reqid,setreqid] = useState("");
const [email,setemail] = useState("");
const [password,setpassword] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();
 
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
        { role === "Policy Maker"?( 
           <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
             value={email}
             onChange={(e)=>{setemail(e.target.value)}}
              required
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
             value={password}
             onChange={(e)=>{setpassword(e.target.value)}}
              required
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="text"
              placeholder="Request Id"
             value={reqid}
             onChange={(e)=>{setreqid(e.target.value)}}
              required
            />
          </div>
   
          <button type="submit" className="btn-submit">
            Log In
          </button>
        </form>
      )
        :
        (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
             value={email}
             onChange={(e)=>{setemail(e.target.value)}}
              required
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
             value={password}
             onChange={(e)=>{setpassword(e.target.value)}}
              required
            />
          </div>
          <div className="link">
          <Link to="/signup" style={{textDecoration:"none"}}>New user ?</Link></div>
          <button type="submit" className="btn-submit">
            Log In
          </button>
        </form>
        )
      }
      </div>
    </div>
  );
};

export default Login;
