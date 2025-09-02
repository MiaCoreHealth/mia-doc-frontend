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
                <button type="submit" className="send-button" disabled={isLoading || !currentMessage.trim()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/></svg>
                </button>
            </form>
        </div>
    </div>
  );
}

export default SemptomAnalizi;
