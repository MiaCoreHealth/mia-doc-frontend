import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BMIGauge from './BMIGauge';
import WeightTracker from './WeightTracker';

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
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    return bmi;
  };
  const age = calculateAge(user.date_of_birth);
  const bmi = calculateBMI(user.weight_kg, user.height_cm);
  const getUsernameFromEmail = (email) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header"><h5>Sağlık Paneli</h5></div>
      <div className="card-body">
        <div className="row text-center align-items-center">
          <div className="col-md-4 border-end">
            <h6 className="text-muted">Hoş Geldin</h6>
            <h4>{getUsernameFromEmail(user.email)}</h4>
            <h6 className="mt-2">{age ? `${age} Yaşında` : 'Yaş Belirtilmemiş'}</h6>
          </div>
          <div className="col-md-4 border-end">
            <BMIGauge bmi={bmi} />
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
  const [healthTip, setHealthTip] = useState("");
  const [isTipLoading, setIsTipLoading] = useState(true);

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
  
  useEffect(() => {
    if (!user || Notification.permission !== 'granted') {
      return;
    }

    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const checkMedicationTimes = async () => {
        try {
            const response = await axios.get(`${apiUrl}/medications/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
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
                  notification.onclick = () => {
                    window.focus();
                  };
                  sessionStorage.setItem(notificationKey, 'true');
                }
              }
            });
    
          } catch (error) {
            console.error("İlaç hatırlatma servisi hatası:", error);
          }
    };

    const intervalId = setInterval(checkMedicationTimes, 10000);

    return () => clearInterval(intervalId);
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
      
      <HealthPanel user={user} />
      <HealthTip tip={healthTip} isLoading={isTipLoading} />

      <WeightTracker />

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
    </div>
  );
}

export default Dashboard;
