import { useState } from 'react';
import axios from "axios";
import { Zap, User, Mail, Lock } from 'lucide-react';
import './Signup.css';
import { Link,useNavigate } from 'react-router-dom';


const Signup = () => {

const navigate = useNavigate();
 const[fullname,setfullname] = useState("");
 const[email,setemail] = useState("");
 const [password,setpassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!fullname || !email ||!password){
      alert("Enter the details!")
    }
    axios.post('http://localhost:5000/api/v1/user/sign',{fullname,email,password})
    .then(()=>{alert("User Signed Sucessfully !")
      navigate('./Home')
    })
    .catch((error)=>{alert("Couldnt sign you in !")
      console.log(error)
    })
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
              value={fullname}
              onChange={(e)=>{setfullname(e.target.value)}}
              required
            />
          </div>
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
           
          </div>
            <div className="link">
        <Link to="/Login" style={{textDecoration:"none"}}>Existing User ?</Link>
          </div>
          <button type="submit" className="btn-submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
