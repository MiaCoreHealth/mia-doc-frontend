import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Profile from './Profile';
import LandingPage from './LandingPage';
import RaporAnalizi from './RaporAnalizi'; // Yeni sayfamızı import ediyoruz

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('userToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>; // veya bir spinner component
  }

  return (
    <Router>
      <div className="container my-5">
        <Routes>
          <Route 
            path="/" 
            element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login handleLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/" />} 
          />
          {/* YENİ ROTA */}
          <Route 
            path="/rapor-analizi" 
            element={isAuthenticated ? <RaporAnalizi handleLogout={handleLogout} /> : <Navigate to="/" />} 
          />
          {/* Semptom analizi için gelecekteki rota */}
          {/* <Route path="/semptom-analizi" element={isAuthenticated ? <SemptomAnalizi handleLogout={handleLogout} /> : <Navigate to="/" />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
