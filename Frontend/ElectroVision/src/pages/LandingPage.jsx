import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Zap,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const gotoLogin = () => {
    navigate("/login");
  };
  const userTypes = [
    {
      id: "government",
      title: "Government Official",
      description:
        "Access comprehensive electricity demand analytics, historical data, and system-wide insights",
      icon: Shield,
      features: [
        "Real-time demand monitoring",
        "Historical trend analysis",
        "Regional demand breakdown",
        "System performance metrics",
      ],
      badge: "High Security",
      colorClass: "gov-color",
    },
    {
      id: "policy",
      title: "Policy Maker",
      description:
        "Run scenario analyses and impact assessments for policy decisions",
      icon: Settings,
      features: [
        "What-if scenario modeling",
        "Policy impact analysis",
        "Parameter adjustment tools",
        "Demand forecasting",
      ],
      badge: "Restricted",
      colorClass: "policy-color",
    },
    {
      id: "user",
      title: "Public User",
      description:
        "Subscribe to daily electricity demand updates and energy consumption insights",
      icon: Users,
      features: [
        "Daily demand reports",
        "Energy usage insights",
        "Peak hour notifications",
        "Conservation tips",
      ],
      badge: "Public",
      colorClass: "user-color",
    },
  ];

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-inner">
          <div className="logo-wrapper">
            <div className="logo-icon-bg">
              <Zap className="logo-icon" />
            </div>
            <div>
              <h1 className="site-title">ElectriScope</h1>
              <p className="site-subtitle">
                National Electricity Demand Prediction System
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <TrendingUp className="hero-badge-icon" />
            Advanced Demand Analytics Platform
          </div>
          <h2 className="hero-title">
            Intelligent Energy
            <span className="hero-gradient">Forecasting</span>
          </h2>
          <p className="hero-subtext">
            Empowering data-driven decisions with real-time electricity demand
            predictions, scenario modeling, and comprehensive energy analytics.
          </p>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="roles">
        <div className="roles-inner">
          <div className="roles-header">
            <h3 className="roles-title">Choose Your Access Level</h3>
            <p className="roles-subtitle">
              Select your role to access specialized tools and insights
            </p>
          </div>
          <div className="roles-grid">
            {userTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card key={type.id} className="role-card">
                  <div className={`role-card-topbar ${type.colorClass}`} />
                  <CardHeader>
                    <div className="role-card-header">
                      <div className={`role-card-icon ${type.colorClass}`}>
                        <IconComponent className="role-icon" />
                      </div>
                      <Badge variant="secondary" className="role-badge">
                        {type.badge}
                      </Badge>
                    </div>
                    <CardTitle className="role-title">{type.title}</CardTitle>
                    <CardDescription className="role-desc">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="role-feature-list">
                      {type.features.map((feature, index) => (
                        <div key={index} className="role-feature">
                          <div className="feature-dot" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="role-button"
                      variant="outline"
                      onClick={gotoLogin}
                    >
                      Access {type.title} Portal
                      <BarChart3 className="role-button-icon" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value primary">99.9%</div>
            <div className="stat-label">Prediction Accuracy</div>
          </div>
          <div className="stat">
            <div className="stat-value secondary">24/7</div>
            <div className="stat-label">Real-time Monitoring</div>
          </div>
          <div className="stat">
            <div className="stat-value accent">50+</div>
            <div className="stat-label">Analysis Parameters</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <p>
            © 2024 ElectriScope. Powered by advanced machine learning and
            real-time data analytics.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
