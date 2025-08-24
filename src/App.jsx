// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Bileşenleri import ediyoruz
import Dashboard from './Dashboard.jsx';
import VerifyEmail from './VerifyEmail.jsx';
import Profile from './Profile.jsx';
import LandingPage from './LandingPage.jsx'; // Yeni karşılama sayfamız
import Login from './Login.jsx';
import Register from './Register.jsx';

import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('userToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('userToken', token);
    } else {
      localStorage.removeItem('userToken');
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <Router>
      <div className="container py-4">
        <header className="text-center mb-4">
          {/* Başlığımız artık burada */}
          <h1>MiaCore Health Sağlık Asistanı</h1>
        </header>
        <main>
          <Routes>
            {/* Ana Sayfa Yönlendirmesi */}
            <Route path="/" element={!token ? <LandingPage /> : <Dashboard handleLogout={handleLogout} />} />

            {/* Giriş ve Kayıt Sayfaları */}
            <Route path="/login" element={!token ? <div className="d-flex justify-content-center"><Login onLoginSuccess={setToken} /></div> : <Navigate to="/" />} />
            <Route path="/register" element={!token ? <div className="d-flex justify-content-center"><Register /></div> : <Navigate to="/" />} />

            {/* Korumalı Sayfalar */}
            <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

            {/* Diğer Sayfalar */}
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;