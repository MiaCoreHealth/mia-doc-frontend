import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor.');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(`${apiUrl}/register/`, { email, password });
      setMessage(response.data.mesaj + ' Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(error.response.data.detail);
      } else {
        setMessage('Kayıt sırasında bir hata oluştu.');
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
            <p className="tagline">Kişisel sağlık asistanınıza katılın.</p>
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
          <div className="mb-3">
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
          <div className="mb-4">
            <label htmlFor="confirmPasswordInput" className="form-label">Şifreyi Onayla</label>
            <input
              type="password"
              className="form-control"
              id="confirmPasswordInput"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {message && <div className={`alert ${message.includes('başarıyla') ? 'alert-success' : 'alert-danger'} mb-3`}>{message}</div>}

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
             {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-footer">
          Zaten bir hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
