// frontend/src/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="text-center landing-container">
      <img src="/images/mia-doc_avatar.png" alt="MiaCore Health Asistanı" className="landing-avatar mb-4" />
      <h2 className="mb-3">Merhaba, Ben MiaCore Health Sağlık Asistanıyım!</h2>
      <p className="lead text-muted mb-4">Sizin için sağlık raporlarınızı saniyeler içinde, anlaşılır bir dilde yorumlayabilirim.</p>
      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <Link to="/register" className="btn btn-primary btn-lg px-4 gap-3">Kayıt Ol</Link>
        <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">Giriş Yap</Link>
      </div>
    </div>
  );
}

export default LandingPage;