import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BMIGauge from './BMIGauge';
import WeightTracker from './WeightTracker';

// Sağlık Paneli Bileşeni
const HealthPanel = ({ user }) => {
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
      <div className="card-header d-flex justify-content-between align-items-center" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', padding: '1.25rem' }}>
        {/* DÜZELTME: Başlık ortalandı ve ikon değiştirildi */}
        <div style={{ flex: 1 }}></div>
        <h5 className="m-0 text-primary fw-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clipboard2-pulse-fill me-2" viewBox="0 0 16 16">
            <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5"/>
            <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5M9.98 5.356 11.372 10h.128a.5.5 0 0 1 0 1H11a.5.5 0 0 1-.479-.356l-.94-3.135-1.092 5.096a.5.5 0 0 1-.968.039L6.383 8.85l-.936 1.873A.5.5 0 0 1 5 11h-.5a.5.5 0 0 1 0-1h.128l1.372-2.744a.5.5 0 0 1 .956.05l1.103 2.453 1.25-5.223a.5.5 0 0 1 .956.05Z"/>
          </svg>
          Sağlık Panelim
        </h5>
        <div className="d-flex justify-content-end" style={{ flex: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
        </div>
      </div>

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

// Günün Tavsiyesi Bileşeni
const HealthTip = ({ tip, isLoading }) => {
    return (
        <div className="card shadow-sm mb-4 bg-light">
            <div className="card-body text-center">
                <h6 className="card-title" style={{color: 'var(--primary-color)'}}>💡 Mia'dan Günün Tavsiyesi</h6>
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

  // İlaç hatırlatma ve veri çekme mantığı aynı kalıyor.
  React.useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('userToken');
    if (!token) { handleLogout(); return; }
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchInitialData = async () => {
      try {
        const profilePromise = axios.get(`${apiUrl}/profile/me/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const tipPromise = axios.get(`${apiUrl}/health-tip/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const [profileResponse, tipResponse] = await Promise.all([profilePromise, tipPromise]);
        if (isMounted) {
            setUser(profileResponse.data);
            setHealthTip(tipResponse.data.tip);
            setIsTipLoading(false);
        }
      } catch (error) {
        console.error("Başlangıç verileri alınamadı:", error);
        if (isMounted) handleLogout();
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, [handleLogout]);
  
  React.useEffect(() => {
    if (!user || Notification.permission !== 'granted') return;
    let isMounted = true;
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    const checkMedicationTimes = async () => {
        try {
            const response = await axios.get(`${apiUrl}/medications/`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!isMounted) return;
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
    const intervalId = setInterval(checkMedicationTimes, 10000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [user]);

  return (
    <div>
      <nav className="navbar main-navbar mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">MiaCore Health</span>
          <div>
            <Link to="/profile" className="btn btn-outline-secondary me-2 btn-sm">Profilim</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Çıkış Yap</button>
          </div>
        </div>
      </nav>
      
      <HealthPanel user={user} />
      <HealthTip tip={healthTip} isLoading={isTipLoading} />

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="action-card">
            {/* DÜZELTME: İkon ve başlık orantılandı */}
            <div className="d-flex align-items-center mb-3">
              <div className="action-card-icon bg-primary-light me-3" style={{width: '40px', height: '40px'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.5 2.5a.5.5 0 0 0-1 0v4.328a2.5 2.5 0 0 0-2.031 2.475C5.468 11.23 6.6 12.5 8 12.5s2.532-1.27 2.532-2.697a2.5 2.5 0 0 0-2.031-2.475V2.5zM8 1a2.5 2.5 0 0 1 2.5 2.5V9a.5.5 0 0 1-1 0V5a.5.5 0 0 1-1 0V3.5a1.5 1.5 0 1 0-3 0V9a.5.5 0 0 1-1 0V3.5A2.5 2.5 0 0 1 8 1z"/></svg>
              </div>
              <h5 className="card-title mb-0">Rapor Analizi</h5>
            </div>
            <p className="card-text">Tıbbi raporlarınızı Mia'ya yükleyip anında, kişiselleştirilmiş yorumlar alın.</p>
            <Link to="/rapor-analizi" className="btn btn-primary mt-auto">Başla</Link>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="action-card">
            {/* DÜZELTME: İkon ve başlık orantılandı */}
            <div className="d-flex align-items-center mb-3">
              <div className="action-card-icon bg-success-light me-3" style={{width: '40px', height: '40px'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16a.5.5 0 0 0 .5-.5v-1.288c.353.033.712.05 1.074.05 3.328 0 6.038-2.08 6.038-5.672 0-2.083-1.22-3.874-3.048-4.783.05-.164.08-.334.08-.516 0-.82-.66-1.48-1.48-1.48-.553 0-1.037.3-1.29.742-.25.44-.69.804-1.23.952-1.27.33-2.628-.276-2.91-.494l-.06-.04a1.5 1.5 0 0 0-.876-.234c-.82 0-1.48.66-1.48 1.48 0 .182.03.352.08.516C1.22 4.456 0 6.247 0 8.328c0 3.593 2.71 5.672 6.038 5.672.362 0 .721-.017 1.074-.05V15.5a.5.5 0 0 0 .5.5zM4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
              </div>
              <h5 className="card-title mb-0">Hangi Doktora Gitmeliyim?</h5>
            </div>
            <p className="card-text">Belirtilerinizi Mia'ya anlatın, sizi en doğru tıbbi branşa yönlendirelim.</p>
            <Link to="/semptom-analizi" className="btn btn-success mt-auto">Başla</Link>
          </div>
        </div>
      </div>
      
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

