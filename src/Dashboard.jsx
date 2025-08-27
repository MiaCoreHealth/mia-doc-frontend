import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import History from './History.jsx';

// --- Sağlık Paneli Bileşeni (Değişiklik yok) ---
const HealthPanel = ({ user }) => {
  if (!user) {
    return <div className="text-center my-3"><span className="spinner-border spinner-border-sm"></span> Sağlık paneli yükleniyor...</div>;
  }
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
      <div className="card-header"><h5>Sağlık Paneli</h5></div>
      <div className="card-body">
        <div className="row text-center">
          <div className="col-md-4 border-end"><h6 className="text-muted">Hoş Geldin</h6><h4>{getUsernameFromEmail(user.email)}</h4></div>
          <div className="col-md-4 border-end"><h6 className="text-muted">Yaş / VKİ</h6><h4>{age ? `${age} Yaş` : 'N/A'} / <span title={interpretation}>{bmi || 'N/A'}</span></h4></div>
          <div className="col-md-4"><h6 className="text-muted">Bilinen Kronik Hastalıklar</h6><h5 className="text-truncate" title={user.chronic_diseases || 'Belirtilmemiş'}>{user.chronic_diseases || 'Belirtilmemiş'}</h5></div>
        </div>
      </div>
    </div>
  );
};

// --- Günün Tavsiyesi Bileşeni (Değişiklik yok) ---
const HealthTip = ({ tip, isLoading }) => {
    return (
        <div className="card shadow-sm mb-4 bg-light border-primary">
            <div className="card-body text-center">
                <h6 className="card-title text-primary">💡 Mia'dan Günün Tavsiyesi</h6>
                {isLoading ? (
                    <p className="card-text fst-italic">Sana özel bir tavsiye hazırlıyorum...</p>
                ) : (
                    <p className="card-text fw-bold">{tip}</p>
                )}
            </div>
        </div>
    );
};

function Dashboard({ handleLogout }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [healthTip, setHealthTip] = useState("");
  const [isTipLoading, setIsTipLoading] = useState(true);

  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) { 
      handleLogout(); 
      return; 
    }
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchInitialData = async () => {
      try {
        const profilePromise = axios.get(`${apiUrl}/profile/me/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const tipPromise = axios.get(`${apiUrl}/health-tip/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const [profileResponse, tipResponse] = await Promise.all([profilePromise, tipPromise]);
        
        const fetchedUser = profileResponse.data;
        setUser(fetchedUser);
        
        // --- YENİ KARŞILAMA MESAJI ---
        setMessages([
          {
            sender: 'mia-doc',
            text: `Merhaba ${getUsernameFromEmail(fetchedUser.email)}! Ben kişisel sağlık asistanın Mia. Sana nasıl yardımcı olabilirim? Analiz etmemi istediğin bir raporu yükleyebilir veya aklına takılan bir sağlık sorusunu sorabilirsin.`
          }
        ]);

        setHealthTip(tipResponse.data.tip);
        setIsTipLoading(false);

      } catch (error) {
        console.error("Başlangıç verileri alınamadı:", error);
        setHealthTip("Sağlıklı bir gün geçirmen dileğiyle!");
        setIsTipLoading(false);
        if (!user) {
            handleLogout();
        }
      }
    };
    fetchInitialData();
  }, [handleLogout]);

  // Diğer fonksiyonlar (sendMessageToApi vb.) aynı, değişiklik yok
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
    const historyToSend = messages.filter(m => m.text.startsWith('Merhaba') === false);
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
    if (file) { sendMessageToApi({ file: file }); }
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
          {/* Navbar başlığını da güncelleyelim */}
          <span className="navbar-brand">Miacore Health & Asistanın Mia</span>
          <div>
            <Link to="/profile" className="btn btn-outline-secondary me-2">Profilim</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış Yap</button>
          </div>
        </div>
      </nav>
      
      <HealthPanel user={user} />
      <HealthTip tip={healthTip} isLoading={isTipLoading} />
      
      <div className="chat-window card shadow-sm mb-3">
        <div className="card-body">
          {messages.map((msg, index) => (
            <div key={index} className={`d-flex align-items-end mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              {msg.sender === 'mia-doc' && <img src="https://i.imgur.com/OnfAvOo.png" alt="Mia Avatar" className="avatar" />}
              <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.text === '...' && (
             <div className="d-flex align-items-end mb-3 justify-content-start">
               <img src="https://i.imgur.com/OnfAvOo.png" alt="Mia Avatar" className="avatar" />
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
        <input type="text" className="form-control" placeholder="Mia'ya bir soru sor..." value={currentQuestion} onChange={(e) => setCurrentQuestion(e.target.value)} disabled={isLoading} />
        <button className="btn btn-primary" type="submit" disabled={isLoading || !currentQuestion.trim()}>
          {isLoading ? '...' : 'Gönder'}
        </button>
      </form>

      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="forSomeoneElseCheck" checked={forSomeoneElse} onChange={(e) => setForSomeoneElse(e.target.checked)} disabled={isLoading} />
        <label className="form-check-label" htmlFor="forSomeoneElseCheck">
          Bu rapor başkasına ait (geçmişe kaydedilmeyecek)
        </label>
      </div>

      <History key={historyKey} />
    </div>
  );
}

export default Dashboard;
