import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ handleLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const apiUrl = import.meta.env.VITE_API_URL;
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${apiUrl}/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token } = response.data;
      localStorage.setItem('userToken', access_token);
      handleLoginSuccess();
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(error.response.data.detail);
      } else {
        setMessage('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
            <div className="logo">MiaCore Health</div>
            <p className="tagline">Kişisel sağlık asistanınıza hoş geldiniz.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">E-posta Adresi</label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@mail.com"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="passwordInput" className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {message && <div className="alert alert-danger mb-3">{message}</div>}

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          Hesabın yok mu? <Link to="/register">Hemen Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
