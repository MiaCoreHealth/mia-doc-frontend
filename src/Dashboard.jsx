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
  const [currentQuestion, setCurrentQuestion] = useState(""); // YENİ: Kullanıcının yazdığı soruyu tutar

  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  
  useEffect(() => {
    const fetchUserAndWelcome = async () => {
      // ... (Bu fonksiyon aynı, değişiklik yok)
    };
    fetchUserAndWelcome();
  }, [handleLogout]);

  // YENİ: Hem dosya hem de metin göndermek için ortak fonksiyon
  const sendMessageToApi = async ({ file, question, history }) => {
    setIsLoading(true);
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;

    if (file) {
      setMessages(prev => [...prev, { sender: 'user', text: `Yüklendi: ${file.name}` }]);
    }
    if (question) {
      setMessages(prev => [...prev, { sender: 'user', text: question }]);
      setCurrentQuestion(""); // Yazı kutusunu temizle
    }
    
    setMessages(prev => [...prev, { sender: 'mia-doc', text: '...' }]); // Düşünüyorum...

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
      
      // "Düşünüyorum..." mesajını silip yerine gerçek cevabı koy
      setMessages(prev => [...prev.slice(0, -1), { sender: 'mia-doc', text: response.data.analysis_result }]);
      
      if (file) { // Sadece ilk analiz geçmişi yeniler
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
      // İlk mesajlar hariç tüm geçmişi gönder
      const historyToSend = messages.slice(1);
      sendMessageToApi({ file: file, history: historyToSend });
    }
  };

  const handleSendQuestion = (event) => {
    event.preventDefault();
    if (!currentQuestion.trim()) return;
    // İlk mesajlar hariç tüm geçmişi gönder
    const historyToSend = messages.slice(1);
    sendMessageToApi({ question: currentQuestion, history: historyToSend });
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        {/* ... (Navbar aynı) ... */}
      </nav>
      
      <div className="chat-window card shadow-sm mb-3">
        <div className="card-body">
          {/* ... (Mesajları gösterme kısmı aynı) ... */}
        </div>
      </div>
      
      {/* --- YENİ SOHBET GİRİŞ ALANI --- */}
      <form onSubmit={handleSendQuestion} className="input-group mb-3">
        {/* Dosya yükleme butonu */}
        <label className="btn btn-secondary" htmlFor="fileInput">
          📎 Rapor Yükle
        </label>
        <input type="file" className="form-control" onChange={handleFileChange} disabled={isLoading} id="fileInput" style={{ display: 'none' }}/>
        
        {/* Soru yazma alanı */}
        <input 
          type="text" 
          className="form-control" 
          placeholder="Takip sorunuzu buraya yazın..."
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          disabled={isLoading}
        />
        {/* Gönder butonu */}
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? '...' : 'Gönder'}
        </button>
      </form>

      <History key={historyKey} />
    </div>
  );
}