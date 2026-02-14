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
      {/* Optional: Back Button (For testing navigation) */}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center gap-2">
          <ArrowLeft size={16}/> Back to Landing
        </Link>
      </div>

      {/* 2. Render the correct dashboard based on the role */}
      {role === "Government Official" && <GovernmentDashboard />}
      {role === "Policy Maker" && <PolicyDashboard />}
      {role === "Public User" && <PublicDashboard />}
    </div>
  );
};

export default Home;