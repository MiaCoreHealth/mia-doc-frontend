// frontend/src/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import History from './History.jsx';
// Artık avatarı buradan import etmiyoruz.

function Dashboard({ handleLogout }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");

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
          {
            sender: 'mia-doc',
            text: `Merhaba ${getUsernameFromEmail(fetchedUser.email)}, ben MİA-DOC. Analiz etmemi istediğin tıbbi raporunu (.jpg, .png) lütfen aşağıdan seç.`
          }
        ]);
      } catch (error) {
        console.error("Kullanıcı bilgisi alınamadı:", error);
        handleLogout();
      }
    };

    fetchUserAndWelcome();
  }, [handleLogout]);

  const sendMessageToApi = async ({ file, question, history }) => {
    setIsLoading(true);
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;

    if (file) {
      setMessages(prev => [...prev, { sender: 'user', text: `Yüklendi: ${file.name}` }]);
    }
    if (question) {
      setMessages(prev => [...prev, { sender: 'user', text: question }]);
      setCurrentQuestion("");
    }
    
    setMessages(prev => [...prev, { sender: 'mia-doc', text: '...' }]);

    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }
    if (question) {
        formData.append('question', question);
    }
    formData.append('history_json', JSON.stringify(history));

    try {
      const response = await axios.post(`${apiUrl}/report/analyze/`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev.slice(0, -1), { sender: 'mia-doc', text: response.data.analysis_result }]);
      
      if (file) {
        setHistoryKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      const errorText = error.response ? error.response.data.detail : 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev.slice(0, -1), { sender: 'mia-doc', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const historyToSend = messages.slice(1);
      sendMessageToApi({ file: file, history: historyToSend });
      event.target.value = null; // Dosya seçildikten sonra input'u sıfırla
    }
  };

  const handleSendQuestion = (event) => {
    event.preventDefault();
    if (!currentQuestion.trim()) return;
    const historyToSend = messages.slice(1);
    sendMessageToApi({ question: currentQuestion, history: historyToSend });
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">
            {user ? `${getUsernameFromEmail(user.email)} & MİA-DOC` : 'Yükleniyor...'}
          </span>
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
              {msg.sender === 'mia-doc' && <img src="https://i.imgur.com/OnfAvOo.png" alt="MİA-DOC Avatar" className="avatar" />}
              <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && (
             <div className="d-flex align-items-end mb-3 justify-content-start">
               <img src="https://i.imgur.com/OnfAvOo.png" alt="MİA-DOC Avatar" className="avatar" />
               <div className="message-bubble mia-doc">
                 <span className="spinner-border spinner-border-sm"></span> Düşünüyorum...
               </div>
             </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSendQuestion} className="input-group mb-3">
        <label className="btn btn-secondary" htmlFor="fileInput">📎 Rapor Yükle</label>
        <input type="file" className="form-control" onChange={handleFileChange} disabled={isLoading} id="fileInput" style={{ display: 'none' }}/>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Takip sorunuzu buraya yazın..."
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          disabled={isLoading}
        />
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? '...' : 'Gönder'}
        </button>
      </form>
      <History key={historyKey} />
    </div>
  );
}

export default Dashboard;