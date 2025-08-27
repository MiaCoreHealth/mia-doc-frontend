import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ handleLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Hata mesajını temizle

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/token`, {
        username: email,
        password: password
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      handleLogin(response.data.access_token);
      navigate('/dashboard');

    } catch (err) {
      // DEĞİŞİKLİK: Backend'den gelen spesifik hatayı göster
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    // DEĞİŞİKLİK: Sayfayı ortalamak için yapı eklendi
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-lg">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <img src="https://i.imgur.com/OnfAvOo.png" alt="Mia" style={{ width: '80px', height: '80px' }} />
              <h2 className="card-title mt-2">Tekrar Hoş Geldin!</h2>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">E-posta Adresi</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Şifre</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Giriş Yap</button>
              </div>
            </form>
            <div className="text-center mt-3">
              <p>Hesabın yok mu? <Link to="/register">Kayıt Ol</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
