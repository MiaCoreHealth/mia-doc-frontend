import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SemptomAnalizi({ handleLogout }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sayfa yüklendiğinde Mia'nın ilk karşılama mesajını ekle
  useEffect(() => {
    setMessages([
      {
        sender: 'mia-doc',
        text: "Merhaba, ben Mia. Yaşadığın sağlık sorunlarını ve belirtilerini anlatabilir misin? Seni en doğru doktora yönlendirmek için buradayım."
      }
    ]);
  }, []);

  const sendMessageToApi = async (messageText) => {
    if (!messageText.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: messageText }];
    setMessages(newMessages);
    setCurrentMessage("");
    setIsLoading(true);

    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const formData = new FormData();
    formData.append('history_json', JSON.stringify(newMessages));

    try {
      const response = await axios.post(`${apiUrl}/symptom-analyze/`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { sender: 'mia-doc', text: response.data.analysis_result }]);
    } catch (error) {
      const errorText = error.response ? error.response.data.detail : 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev, { sender: 'mia-doc', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    sendMessageToApi(currentMessage);
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">Mia ile Semptom Analizi</span>
          <div>
            <Link to="/" className="btn btn-outline-secondary me-2">Ana Sayfa</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış Yap</button>
          </div>
        </div>
      </nav>
      
      <div className="chat-window card shadow-sm mb-3">
        <div className="card-body" style={{ height: '60vh', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex align-items-end mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              {msg.sender === 'mia-doc' && 
                <img 
                  src="https://i.imgur.com/OnfAvOo.png" 
                  alt="Mia Avatar" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} 
                />
              }
              <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && (
             <div className="d-flex align-items-end mb-3 justify-content-start">
               <img 
                 src="https://i.imgur.com/OnfAvOo.png" 
                 alt="Mia Avatar" 
                 style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} 
               />
               <div className="message-bubble mia-doc">
                 <span className="spinner-border spinner-border-sm"></span> Mia düşünüyor...
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="input-group mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Belirtilerini buraya yaz..." 
          value={currentMessage} 
          onChange={(e) => setCurrentMessage(e.target.value)} 
          disabled={isLoading} 
        />
        <button className="btn btn-primary" type="submit" disabled={isLoading || !currentMessage.trim()}>
          Gönder
        </button>
      </form>
    </div>
  );
}

export default SemptomAnalizi;
