import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Import the 3 dashboards
import GovernmentDashboard from './dashboards/GovernmentDashboard';
import PolicyDashboard from './dashboards/PolicyDashboard';
import PublicDashboard from './dashboards/PublicDashboard';

const Home = () => {
  const location = useLocation();
  const role = location.state?.role;

  // 1. Security Check: Redirect to Landing if no role is found
  if (!role) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      {role === "Government Official" && <GovernmentDashboard />}
      {role === "Policy Maker" && <PolicyDashboard />}
      {role === "Public User" && <PublicDashboard />}
    </div>
  );
};

export default Home;