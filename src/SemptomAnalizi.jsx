import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from './api'; // DEĞİŞİKLİK

function SemptomAnalizi() {
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

  useEffect(() => {
    setMessages([
      { sender: 'mia', text: 'Merhaba, ben Mia. Yaşadığın belirtileri ve şikayetlerini bana anlatabilirsin. Seni en doğru tıbbi branşa yönlendirmek için buradayım.' }
    ]);
  }, []);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setIsLoading(true);
    const newMessage = { sender: 'user', text: messageText };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setCurrentMessage("");
    
    const formData = new FormData();
    formData.append('history_json', JSON.stringify(newMessages.filter(m => !m.text.startsWith('Merhaba'))));

    try {
      // DEĞİŞİKLİK: axios yerine api kullanılıyor ve headers kaldırıldı
      const response = await api.post(`/symptom-analyze/`, formData);
      setMessages(prev => [...prev, { sender: 'mia', text: response.data.analysis_result }]);
    } catch (error) {
      const errorText = error.response?.data?.detail || 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev, { sender: 'mia', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(currentMessage);
  };

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <Link to="/" className="btn btn-outline-secondary btn-sm me-3">← Geri</Link>
        <h5>Semptom Analizi Asistanı</h5>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === 'user' ? 'user-row' : 'mia-row'}`}>
            {msg.sender === 'mia' && <img src="https://i.imgur.com/OnfAvOo.png" alt="Mia Avatar" className="avatar" />}
            <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'mia-bubble'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-row mia-row">
            <img src="https://i.imgur.com/OnfAvOo.png" alt="Mia Avatar" className="avatar" />
            <div className="message-bubble mia-bubble">Mia düşünüyor...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            placeholder="Belirtilerini buraya yaz..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading || !currentMessage.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default SemptomAnalizi;
