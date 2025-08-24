// frontend/src/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import History from './History.jsx';

function Dashboard({ handleLogout }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [forSomeoneElse, setForSomeoneElse] = useState(false);

  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  useEffect(() => {
    const fetchUserAndWelcome = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) { handleLogout(); return; }
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await axios.get(`${apiUrl}/users/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const fetchedUser = response.data;
        setUser(fetchedUser);
        setMessages([
          { sender: 'mia-doc', text: `Merhaba ${getUsernameFromEmail(fetchedUser.email)}, ben MİA-DOC...` }
        ]);
      } catch (error) {
        console.error("Kullanıcı bilgisi alınamadı:", error);
        handleLogout();
      }
    };
    fetchUserAndWelcome();
  }, [handleLogout]);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setMessages(prev => [...prev, { sender: 'mia-doc', text: `Lütfen önce bir rapor dosyası seçin.` }]);
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    setMessages(prev => [...prev, { sender: 'user', text: `Yüklendi: ${selectedFile.name}` }]);
    setMessages(prev => [...prev, { sender: 'mia-doc', text: 'Raporunu aldım, inceliyorum...' }]);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('for_someone_else', forSomeoneElse);
    try {
      const response = await axios.post(`${apiUrl}/report/analyze/`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { sender: 'mia-doc', text: response.data.analysis_result }]);
      if (!forSomeoneElse) {
        setHistoryKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      const errorText = error.response ? error.response.data.detail : 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev, { sender: 'mia-doc', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      document.getElementById('fileInput').value = ''; // Dosya inputunu temizle
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">{user ? `${getUsernameFromEmail(user.email)} & MİA-DOC` : 'Yükleniyor...'}</span>
          <div>
            <Link to="/profile" className="btn btn-outline-secondary me-2">Profilim</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış Yap</button>
          </div>
        </div>
      </nav>
      <div className="chat-window card shadow-sm mb-3">
        <div className="card-body">
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex align-items-end mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              {msg.sender === 'mia-doc' && <img src="/images/mia-doc_avatar.png" alt="MİA-DOC Avatar" className="avatar" />}
              <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && (
             <div className="d-flex align-items-end mb-3 justify-content-start">
               <img src="/images/mia-doc_avatar.png" alt="MİA-DOC Avatar" className="avatar" />
               <div className="message-bubble mia-doc">
                 <span className="spinner-border spinner-border-sm"></span> Düşünüyorum...
               </div>
             </div>
          )}
        </div>
      </div>
      <div className="input-group mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} disabled={isLoading} id="fileInput" />
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={isLoading || !selectedFile}>
          {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </div>
      <div className="form-check mb-3">
        <input 
          className="form-check-input" 
          type="checkbox" 
          id="forSomeoneElseCheck"
          checked={forSomeoneElse}
          onChange={(e) => setForSomeoneElse(e.target.checked)}
          disabled={isLoading}
        />
        <label className="form-check-label" htmlFor="forSomeoneElseCheck">
          Bu rapor başkasına ait (geçmişe kaydedilmeyecek)
        </label>
      </div>
      <History key={historyKey} />
    </div>
  );
}

export default Dashboard;