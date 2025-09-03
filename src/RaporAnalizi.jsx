import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from './api'; // DEĞİŞİKLİK
import History from './History.jsx';

function RaporAnalizi() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [historyKey, setHistoryKey] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      { sender: 'mia', text: 'Merhaba! Ben Mia. Analiz etmemi istediğin tıbbi raporunu (.jpg, .png) yükleyebilir veya bir soru sorabilirsin.' }
    ]);
  }, []);

  const sendMessageToApi = async ({ file, question }) => {
    if (!file && (!question || !question.trim())) return;

    setIsLoading(true);
    
    const userMessages = [];
    if (file) {
      userMessages.push({ sender: 'user', text: `Yüklendi: ${file.name}` });
    }
    if (question) {
      userMessages.push({ sender: 'user', text: question });
    }
    setMessages(prev => [...prev, ...userMessages]);
    setCurrentQuestion("");
    
    const formData = new FormData();
    const historyToSend = messages.filter(m => !m.text.startsWith('Merhaba'));
    
    if (file) formData.append('file', file);
    if (question) formData.append('question', question);
    
    // api.js artık token'ı otomatik eklediği için history'i de gönderiyoruz
    formData.append('history_json', JSON.stringify([...historyToSend, ...userMessages]));
    formData.append('for_someone_else', forSomeoneElse);

    try {
      // DEĞİŞİKLİK: axios yerine api kullanılıyor ve headers kaldırıldı
      const response = await api.post(`/report/analyze/`, formData);
      setMessages(prev => [...prev, { sender: 'mia', text: response.data.analysis_result }]);
      
      if (file && !forSomeoneElse) {
        setHistoryKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      const errorText = error.response?.data?.detail || 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev, { sender: 'mia', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
      if (file && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendMessageToApi({ file });
    }
  };

  const handleSendQuestion = (event) => {
    event.preventDefault();
    sendMessageToApi({ question: currentQuestion });
  };

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <Link to="/" className="btn btn-outline-secondary btn-sm me-3">← Geri</Link>
        <h5>Rapor Analizi Asistanı</h5>
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
        <form onSubmit={handleSendQuestion} className="chat-input-form">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isLoading} id="fileInput" style={{ display: 'none' }} />
          <label htmlFor="fileInput" className="send-button" style={{backgroundColor: '#6c757d', cursor: 'pointer'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/></svg>
          </label>
          <input type="text" className="chat-input" placeholder="Takip sorunuzu buraya yazın..." value={currentQuestion} onChange={(e) => setCurrentQuestion(e.target.value)} disabled={isLoading}/>
          <button type="submit" className="send-button" disabled={isLoading || !currentQuestion.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
          </button>
        </form>
        <div className="form-check mt-2 ms-1">
            <input className="form-check-input" type="checkbox" id="forSomeoneElseCheck" checked={forSomeoneElse} onChange={(e) => setForSomeoneElse(e.target.checked)} disabled={isLoading} />
            <label className="form-check-label small text-muted" htmlFor="forSomeoneElseCheck">Bu rapor başkasına ait (geçmişe kaydedilmeyecek)</label>
        </div>
      </div>
      <div className="p-3">
        <History key={historyKey} />
      </div>
    </div>
  );
}

export default RaporAnalizi;
