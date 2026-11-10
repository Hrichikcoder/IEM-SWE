import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StockInputPage from './pages/StockInputPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';

// route guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#64748b' }}>Checking user session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// navbar
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        StockAnalyzer
      </Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>

        {user ? (
          <>
            <Link to="/analyze" className="nav-link">
              Analyze Stock
            </Link>
            <Link to="/history" className="nav-link">
              History
            </Link>
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
              {user.name}
            </span>
            <button onClick={handleLogout} className="nav-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Sign In
            </Link>
            <Link to="/register" className="nav-btn primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/analyze"
                element={
                  <ProtectedRoute>
                    <StockInputPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results/:id"
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
