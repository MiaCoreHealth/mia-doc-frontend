import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import Profile from './Profile.jsx';
import RaporAnalizi from './RaporAnalizi.jsx';
import SemptomAnalizi from './SemptomAnalizi.jsx';
import LandingPage from './LandingPage.jsx';
import TermsOfService from './TermsOfService.jsx'; // YENİ SAYFA

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('userToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login handleLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        
        {/* YENİ ROTA */}
        <Route path="/kullanim-kosullari" element={<TermsOfService />} />
        
        <Route path="/" element={isAuthenticated ? <Dashboard handleLogout={handleLogout} /> : <LandingPage />} />
        
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/rapor-analizi" element={isAuthenticated ? <RaporAnalizi /> : <Navigate to="/login" />} />
        <Route path="/semptom-analizi" element={isAuthenticated ? <SemptomAnalizi /> : <Navigate to="/login" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

