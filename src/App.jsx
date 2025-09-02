import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import Profile from './Profile.jsx';
import RaporAnalizi from './RaporAnalizi.jsx';
import SemptomAnalizi from './SemptomAnalizi.jsx';
import LandingPage from './LandingPage.jsx';
import TermsOfService from './TermsOfService.jsx';
import Footer from './Footer.jsx'; // 1. YENİLİK: Footer bileşeni buraya dahil edildi.

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
      {/* 2. YENİLİK: Sayfa düzeni, içeriği ve footer'ı kapsayacak şekilde güncellendi. */}
      <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
        <main className="flex-grow-1">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login handleLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            
            <Route path="/kullanim-kosullari" element={<TermsOfService />} />
            
            <Route path="/" element={isAuthenticated ? <Dashboard handleLogout={handleLogout} /> : <LandingPage />} />
            
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/rapor-analizi" element={isAuthenticated ? <RaporAnalizi /> : <Navigate to="/login" />} />
            <Route path="/semptom-analizi" element={isAuthenticated ? <SemptomAnalizi /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* 3. YENİLİK: Footer, tüm sayfaların altında gösterilmesi için buraya eklendi. */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

