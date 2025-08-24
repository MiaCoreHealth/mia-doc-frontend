import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import History from './History.jsx';

// --- YENİ: Sağlık Paneli Bileşeni ---
const HealthPanel = ({ user }) => {
  if (!user) {
    return <div className="text-center my-3"><span className="spinner-border spinner-border-sm"></span> Sağlık paneli yükleniyor...</div>;
  }

  // Yaş Hesaplama Fonksiyonu
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // VKİ Hesaplama ve Yorumlama Fonksiyonu
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return { bmi: null, interpretation: 'Profilinizde boy ve kilo bilgisi eksik.' };
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    let interpretation = '';
    if (bmi < 18.5) interpretation = 'Zayıf';
    else if (bmi >= 18.5 && bmi < 25) interpretation = 'Normal Kilolu';
    else if (bmi >= 25 && bmi < 30) interpretation = 'Fazla Kilolu';
    else interpretation = 'Obez';
    return { bmi, interpretation };
  };

  const age = calculateAge(user.date_of_birth);
  const { bmi, interpretation } = calculateBMI(user.weight_kg, user.height_cm);

  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        <h5>Sağlık Paneli</h5>
      </div>
      <div className="card-body">
        <div className="row text-center">
          <div className="col-md-4 border-end">
            <h6 className="text-muted">Hoş Geldiniz</h6>
            <h4>{getUsernameFromEmail(user.email)}</h4>
          </div>
          <div className="col-md-4 border-end">
            <h6 className="text-muted">Yaş / VKİ</h6>
            <h4>
              {age ? `${age} Yaş` : 'N/A'} / 
              <span title={interpretation}>{bmi || 'N/A'}</span>
            </h4>
          </div>
          <div className="col-md-4">
            <h6 className="text-muted">Bilinen Kronik Hastalıklar</h6>
            <h5 className="text-truncate" title={user.chronic_diseases || 'Belirtilmemiş'}>
              {user.chronic_diseases || 'Belirtilmemiş'}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};


function Dashboard({ handleLogout }) {
  const [user, setUser] = useState(null); // Artık tam profil bilgisini tutacak
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) { 
        handleLogout(); 
        return; 
      }
      
      // DEĞİŞİKLİK: /users/me yerine /profile/me endpoint'ini kullanıyoruz
      const apiUrl = `${import.meta.env.VITE_API_URL}/profile/me/`;
      try {
        const response = await axios.get(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const fetchedUser = response.data;
        setUser(fetchedUser); // Tam profil bilgisi state'e kaydedildi
        setMessages([
          {
            sender: 'mia-doc',
            text: `Merhaba ${getUsernameFromEmail(fetchedUser.email)}, ben MiaCore Health Sağlık Asistanıyım. Analiz etmemi istediğin tıbbi raporunu (.jpg, .png) yükleyebilir veya bir soru sorabilirsin.`
          }
        ]);
      } catch (error) {
        console.error("Kullanıcı profili alınamadı:", error);
        handleLogout();
      }
    };
    fetchUserProfile();
  }, [handleLogout]);

  const sendMessageToApi = async ({ file, question }) => {
    if (!file && (!question || !question.trim())) return;

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
    const historyToSend = messages.filter(m => !m.text.startsWith('Merhaba'));
    
    if (file) formData.append('file', file);
    if (question) formData.append('question', question);
    
    formData.append('history_json', JSON.stringify(historyToSend));
    formData.append('for_someone_else', forSomeoneElse);

    try {
      const response = await axios.post(`${apiUrl}/report/analyze/`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev.slice(0, -1), { sender: 'mia-doc', text: response.data.analysis_result }]);
      
      if (file && !forSomeoneElse) {
        setHistoryKey(prevKey => prevKey + 1);
      }
    } catch (error) {
      const errorText = error.response ? error.response.data.detail : 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev.slice(0, -1), { sender: 'mia-doc', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
      if (file && document.getElementById('fileInput')) {
        document.getElementById('fileInput').value = '';
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendMessageToApi({ file: file });
    }
  };

  const handleSendQuestion = (event) => {
    event.preventDefault();
    if (!currentQuestion.trim()) return;
    sendMessageToApi({ question: currentQuestion });
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">MiaCore Health</span>
          <div>
            <Link to="/profile" className="btn btn-outline-secondary me-2">Profilim</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış Yap</button>
          </div>
        </div>
      </nav>
      
      {/* YENİ: Sağlık Paneli buraya eklendi */}
      <HealthPanel user={user} />
      
      <div className="chat-window card shadow-sm mb-3">
        <div className="card-body">
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex align-items-end mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              {msg.sender === 'mia-doc' && <img src="https://i.imgur.com/OnfAvOo.png" alt="MİA-DOC Avatar" className="avatar" />}
              <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.text === '...' && (
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
        <button className="btn btn-primary" type="submit" disabled={isLoading || !currentQuestion.trim()}>
          {isLoading ? '...' : 'Gönder'}
        </button>
      </form>

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
