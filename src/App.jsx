import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import Profile from './Profile.jsx';
import RaporAnalizi from './RaporAnalizi.jsx';
import SemptomAnalizi from './SemptomAnalizi.jsx';
import LandingPage from './LandingPage.jsx';

function App() {
  // Tarayıcı hafızasındaki token'ı kontrol ederek başlangıç durumunu belirle
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('userToken'));

  // Giriş başarılı olduğunda bu fonksiyon çağrılır
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Çıkış yapıldığında bu fonksiyon çağrılır
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Giriş ve Kayıt sayfaları */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login handleLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        
        {/* Ana Sayfa ve Karşılama */}
        <Route path="/" element={isAuthenticated ? <Dashboard handleLogout={handleLogout} /> : <LandingPage />} />
        
        {/* Korumalı Sayfalar */}
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/rapor-analizi" element={isAuthenticated ? <RaporAnalizi /> : <Navigate to="/login" />} />
        <Route path="/semptom-analizi" element={isAuthenticated ? <SemptomAnalizi /> : <Navigate to="/login" />} />
        
        {/* Tanımsız bir yola gidilirse ana sayfaya yönlendir */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
