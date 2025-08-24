// frontend/src/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import History from './History.jsx';
import miaDocAvatar from './images/mia-doc_avatar.png'; 

function Dashboard({ handleLogout }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  // YENİ: Onay kutusunun durumunu tutacak state
  const [forSomeoneElse, setForSomeoneElse] = useState(false);

  const getUsernameFromEmail = (email) => {
    // ... (fonksiyon aynı, değişiklik yok)
  };
  
  useEffect(() => {
    // ... (useEffect aynı, değişiklik yok)
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

    // FormData'ya artık hem dosyayı hem de onay kutusunun durumunu ekliyoruz
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('for_someone_else', forSomeoneElse);

    try {
      const response = await axios.post(`${apiUrl}/report/analyze/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type artık otomatik olarak ayarlanacak, manuel belirtmeye gerek yok
        },
      });
      
      setMessages(prev => [...prev, { sender: 'mia-doc', text: response.data.analysis_result }]);
      
      // Eğer rapor kendisi içinse geçmişi yenile
      if (!forSomeoneElse) {
        setHistoryKey(prevKey => prevKey + 1);
      }

    } catch (error) {
      const errorText = error.response ? error.response.data.detail : 'Analiz sırasında bir ağ hatası oluştu.';
      setMessages(prev => [...prev, { sender: 'mia-doc', text: `Bir hata oluştu: ${errorText}` }]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      // İsteğe bağlı: Analizden sonra onay kutusunu sıfırla
      setForSomeoneElse(false);
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
        {/* ... (Navbar kısmı aynı) ... */}
      </nav>
      
      <div className="chat-window card shadow-sm mb-3">
        {/* ... (Sohbet penceresi aynı) ... */}
      </div>
      
      <div className="input-group mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} disabled={isLoading} id="fileInput" key={selectedFile ? selectedFile.name : 'file-input'} />
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={isLoading || !selectedFile}>
          {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </div>

      {/* YENİ: Onay kutusu */}
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