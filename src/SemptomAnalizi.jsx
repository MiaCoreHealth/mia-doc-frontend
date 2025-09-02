import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
    
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    const formData = new FormData();
    formData.append('history_json', JSON.stringify(newMessages.filter(m => !m.text.startsWith('Merhaba'))));

    try {
      const response = await axios.post(`${apiUrl}/symptom-analyze/`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
                    <div className="message-bubble mia-bubble">
                        Mia düşünüyor...
                    </div>
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
                {/* DÜZELTME: Gönder butonu ikonu değiştirildi */}
                <button type="submit" className="send-button" disabled={isLoading || !currentMessage.trim()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-right-short" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                    </svg>
                </button>
            </form>
        </div>
    </div>
  );
}

export default SemptomAnalizi;

