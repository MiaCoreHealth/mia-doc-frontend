import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BMIGauge from './BMIGauge';
import WeightTracker from './WeightTracker';

// Sağlık Paneli Bileşeni, artık kendi içinde açılır/kapanır mantığını barındırıyor.
const HealthPanel = ({ user }) => {
  // YENİ: Panelin açık/kapalı durumunu tutan state
  const [isOpen, setIsOpen] = React.useState(false);

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

  const age = calculateAge(user.date_of_birth);

  return (
    <div className="card shadow-sm mb-4">
      {/* YENİ: Tıklanabilir Panel Başlığı - Ortalanmış ve daha şık */}
      <div className="card-header d-flex justify-content-between align-items-center" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <h5 className="m-0 flex-grow-1 text-center text-primary fw-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clipboard2-pulse-fill me-2" viewBox="0 0 16 16">
            <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5"/>
            <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5M9.98 5.356 11.372 10h.128a.5.5 0 0 1 0 1H11a.5.5 0 0 1-.479-.356l-.94-3.135-1.092 5.096a.5.5 0 0 1-.968.039L6.383 8.85l-.936 1.873A.5.5 0 0 1 5 11h-.5a.5.5 0 0 1 0-1h.128l1.372-2.744a.5.5 0 0 1 .956.05l1.103 2.453 1.25-5.223a.5.5 0 0 1 .956.05Z"/>
          </svg>
          Sağlık Panelim
        </h5>
        {/* YENİ: Duruma göre yönü değişen ikon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
      </div>

      {/* YENİ: Bootstrap'in collapse class'ı ile açılır/kapanır içerik alanı */}
      <div className={isOpen ? 'collapse show' : 'collapse'}>
        <div className="card-body">
            <div className="row text-center align-items-center">
                <div className="col-md-4 mb-4 mb-md-0">
                    <BMIGauge bmi={user.weight_kg && user.height_cm ? parseFloat((user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1)) : null} />
                </div>
                 <div className="col-md-8">
                   <WeightTracker />
                </div>
            </div>
             <hr className="my-3" />
             <div className="text-center text-muted small">
                <strong>Yaş:</strong> {age || 'N/A'} | <strong>Kronik Hastalıklar:</strong> {user.chronic_diseases || 'Belirtilmemiş'}
             </div>
        </div>
      </div>
    </div>
  );
};

// HealthTip bileşeninde değişiklik yok
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
  const [user, setUser] = React.useState(null);
  const [healthTip, setHealthTip] = React.useState("");
  const [isTipLoading, setIsTipLoading] = React.useState(true);

  // Veri çekme ve bildirim mantığında değişiklik yok, bu yüzden aynı kalıyor.
  React.useEffect(() => {
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
        
        setUser(profileResponse.data);
        setHealthTip(tipResponse.data.tip);
        setIsTipLoading(false);

      } catch (error) {
        console.error("Başlangıç verileri alınamadı:", error);
        handleLogout();
      }
    };
    
    fetchInitialData();
  }, [handleLogout]);
  
  React.useEffect(() => {
    if (!user || Notification.permission !== 'granted') return;
    
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const checkMedicationTimes = async () => {
        try {
            const response = await axios.get(`${apiUrl}/medications/`, { headers: { 'Authorization': `Bearer ${token}` } });
            const meds = response.data;
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            const currentDate = now.toISOString().split('T')[0];
    
            meds.forEach(med => {
              const times = med.times.split(',').map(t => t.trim());
              if (times.includes(currentTime)) {
                const notificationKey = `mia-notif-${med.id}-${currentDate}-${currentTime}`;
                if (!sessionStorage.getItem(notificationKey)) {
                  const notification = new Notification(`Mia'dan Hatırlatma: İlaç Zamanı!`, {
                    body: `${med.name} (${med.dosage} - ${med.quantity}) ilacınızı alma zamanı geldi.`,
                    icon: 'https://i.imgur.com/OnfAvOo.png',
                    tag: notificationKey
                  });
                  notification.onclick = () => window.focus();
                  sessionStorage.setItem(notificationKey, 'true');
                }
              }
            });
          } catch (error) {
            console.error("İlaç hatırlatma servisi hatası:", error);
          }
    };

    console.log("Bildirim servisi başlatıldı. Her 10 saniyede bir kontrol edilecek.");
    const intervalId = setInterval(checkMedicationTimes, 10000);
    
    return () => {
      console.log("Bildirim servisi durduruldu.");
      clearInterval(intervalId);
    };
  }, [user]);

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">Miacore Health Ana Sayfa</span>
          <div>
            <Link to="/profile" className="btn btn-outline-secondary me-2">Profilim</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış Yap</button>
          </div>
        </div>
      </nav>
      
      {/* Güncellenmiş Sağlık Paneli */}
      <HealthPanel user={user} />
      
      {/* Günün Tavsiyesi panelin altında kalabilir, o anlık bir bilgidir. */}
      <HealthTip tip={healthTip} isLoading={isTipLoading} />

      {/* Asistan Kartları artık her zaman gözünde */}
      <div className="row mt-4 justify-content-center">
        <div className="col-md-5 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <h5 className="card-title">Rapor Analizi</h5>
              <p className="card-text text-muted">Tıbbi raporlarınızı Mia'ya yorumlatın.</p>
              <Link to="/rapor-analizi" className="btn btn-primary mt-auto">Başla</Link>
            </div>
          </div>
        </div>
        <div className="col-md-5 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <h5 className="card-title">Hangi Doktora Gitmeliyim?</h5>
              <p className="card-text text-muted">Belirtilerinizi Mia'ya anlatın.</p>
              <Link to="/semptom-analizi" className="btn btn-success mt-auto">Başla</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for transition */}
      <style>{`
        .transition-transform {
          transition: transform 0.3s ease-in-out;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

