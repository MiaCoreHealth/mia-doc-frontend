import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="container mt-5 text-center">
      <div className="landing-card card shadow-lg p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <img 
          src="https://i.imgur.com/OnfAvOo.png" 
          alt="Mia - Kişisel Sağlık Asistanı" 
          className="mb-4 mx-auto d-block"
          // DEĞİŞİKLİK: Avatarın oranını korumak için stil eklendi
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <h1 className="card-title h2">Merhaba, ben Mia!</h1>
        <p className="card-text lead text-muted">
          Kişisel sağlık asistanın olarak, tıbbi raporlarını anlamana ve sağlık verilerini takip etmene yardımcı olmak için buradayım.
        </p>
        <p className="card-text">
          Başlamak için lütfen giriş yap veya aramıza katıl.
        </p>
        <div className="d-grid gap-2 col-8 mx-auto mt-4">
          <Link to="/login" className="btn btn-primary btn-lg">Giriş Yap</Link>
          <Link to="/register" className="btn btn-outline-secondary">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
