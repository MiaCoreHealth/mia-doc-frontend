import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- YENİ: Gelişmiş İlaç Yönetimi Bileşeni ---
function IlacYonetimi() {
  const [meds, setMeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal ve form yönetimi için state'ler
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMed, setCurrentMed] = useState({ id: null, name: '', dosage: '', quantity: '', times: '', notes: '' });

  const fetchMeds = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/medications/`, { headers: { 'Authorization': `Bearer ${token}` } });
      setMeds(response.data);
    } catch (err) {
      setError('İlaçlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMed(prevState => ({ ...prevState, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentMed({ id: null, name: '', dosage: '', quantity: '', times: '', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setIsEditing(true);
    setCurrentMed(med);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    const medData = {
        name: currentMed.name,
        dosage: currentMed.dosage,
        quantity: currentMed.quantity,
        times: currentMed.times,
        notes: currentMed.notes
    };

    try {
      if (isEditing) {
        // Düzenleme (PUT)
        await axios.put(`${apiUrl}/medications/${currentMed.id}`, medData, { headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        // Ekleme (POST)
        await axios.post(`${apiUrl}/medications/`, medData, { headers: { 'Authorization': `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchMeds();
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu.');
    }
  };
  
  const handleDeleteMed = async (medId) => {
    if (window.confirm("Bu ilacı silmek istediğinizden emin misiniz?")) {
        const token = localStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
            await axios.delete(`${apiUrl}/medications/${medId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchMeds();
        } catch (err) {
            setError('İlaç silinirken bir hata oluştu.');
        }
    }
  };

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5>İlaç Yönetimi</h5>
        <button className="btn btn-primary btn-sm" onClick={openAddModal}>
          + Yeni İlaç Ekle
        </button>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {isLoading ? <p>Yükleniyor...</p> : meds.length === 0 ? <p className="text-muted">Kayıtlı ilacınız yok.</p> : (
          <ul className="list-group">
            {meds.map(med => (
              <li key={med.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="my-0">{med.name}</h6>
                  <small className="text-muted">{med.dosage} / {med.quantity} - Saat: {med.times}</small>
                  {med.notes && <small className="d-block text-info">Not: {med.notes}</small>}
                </div>
                <div>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEditModal(med)}>Düzenle</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMed(med.id)}>Sil</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ekle/Düzenle Modalı */}
      {showModal && (
        <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleFormSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{isEditing ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">İlaç Adı</label><input type="text" name="name" value={currentMed.name} onChange={handleInputChange} className="form-control" required /></div>
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Dozaj (mg/ml)</label><input type="text" name="dosage" value={currentMed.dosage} onChange={handleInputChange} className="form-control" placeholder="Örn: 500 mg" required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Miktar</label><input type="text" name="quantity" value={currentMed.quantity} onChange={handleInputChange} className="form-control" placeholder="Örn: 1 tablet" required /></div>
                  </div>
                  <div className="mb-3"><label className="form-label">Kullanım Saatleri</label><input type="text" name="times" value={currentMed.times} onChange={handleInputChange} className="form-control" placeholder="Örn: 08:00, 20:00" required /></div>
                  <div className="mb-3"><label className="form-label">Notlar</label><input type="text" name="notes" value={currentMed.notes} onChange={handleInputChange} className="form-control" /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                  <button type="submit" className="btn btn-success">Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ... (Profile ve BildirimAyarlari bileşenleri aynı, değişiklik yok)
function BildirimAyarlari() {
    const [permission, setPermission] = useState(Notification.permission);

    const requestPermission = () => {
        Notification.requestPermission().then((result) => {
            setPermission(result);
        });
    };

    const getStatusText = () => {
        if (permission === 'granted') {
            return { text: 'İzin Verildi', class: 'text-success' };
        }
        if (permission === 'denied') {
            return { text: 'Engellendi (Tarayıcı ayarlarından değiştirmeniz gerekir)', class: 'text-danger' };
        }
        return { text: 'İzin Bekleniyor', class: 'text-warning' };
    };

    const { text, class: statusClass } = getStatusText();

    return (
        <div className="card shadow-sm mt-4">
            <div className="card-header">
                <h5>Bildirim Ayarları</h5>
            </div>
            <div className="card-body">
                <p>İlaç hatırlatmalarını alabilmek için tarayıcı bildirimlerine izin vermeniz gerekmektedir.</p>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Durum: </strong>
                        <span className={`fw-bold ${statusClass}`}>{text}</span>
                    </div>
                    {permission === 'default' && (
                        <button className="btn btn-info" onClick={requestPermission}>
                            Bildirimlere İzin Ver
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Profile() {
  const [profileData, setProfileData] = useState({
    date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
    chronic_diseases: '', family_history: '', smoking_status: '',
    alcohol_status: '', pregnancy_status: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('userToken');
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await axios.get(`${apiUrl}/profile/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = response.data;
        const formattedData = {};
        for (const key in profileData) {
          formattedData[key] = data[key] || '';
        }
        setProfileData(formattedData);
      } catch (error) {
        setMessage('Profil bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage('');
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const dataToSend = { ...profileData };
      for (const key in dataToSend) {
        if (dataToSend[key] === '') { dataToSend[key] = null; }
      }
      delete dataToSend.medications; 
      
      await axios.post(`${apiUrl}/profile/me/`, dataToSend, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('Profil bilgileriniz başarıyla güncellendi!');
    } catch (error) {
      setMessage('Güncelleme sırasında bir hata oluştu.');
    }
  };

  if (isLoading) {
    return <p>Profil yükleniyor...</p>;
  }

  return (
    <div>
        <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
            <div className="container-fluid">
                <span className="navbar-brand">Profilim ve Ayarlar</span>
                <div>
                    <Link to="/" className="btn btn-outline-secondary">Ana Sayfa</Link>
                </div>
            </div>
        </nav>

        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title">Kişisel Bilgiler</h4>
            <p className="card-text text-muted">Bu bilgiler, Mia'nın size daha doğru ve kişisel yorumlar yapmasına yardımcı olur.</p>
            
            <form onSubmit={handleSave} className="row g-3">
              <div className="col-md-6"><label htmlFor="date_of_birth" className="form-label">Doğum Tarihi</label><input type="date" className="form-control" id="date_of_birth" name="date_of_birth" value={profileData.date_of_birth} onChange={handleChange} /></div>
              <div className="col-md-6"><label htmlFor="gender" className="form-label">Cinsiyet</label><select className="form-select" id="gender" name="gender" value={profileData.gender} onChange={handleChange}><option value="">Seçiniz...</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option></select></div>
              <div className="col-md-6"><label htmlFor="height_cm" className="form-label">Boy (cm)</label><input type="number" className="form-control" id="height_cm" name="height_cm" value={profileData.height_cm} onChange={handleChange} placeholder="Örn: 175"/></div>
              <div className="col-md-6"><label htmlFor="weight_kg" className="form-label">Kilo (kg)</label><input type="number" className="form-control" id="weight_kg" name="weight_kg" value={profileData.weight_kg} onChange={handleChange} placeholder="Örn: 70"/></div>
              <div className="col-12"><label htmlFor="chronic_diseases" className="form-label">Bilinen Kronik Hastalıklarınız</label><textarea className="form-control" id="chronic_diseases" name="chronic_diseases" rows="2" value={profileData.chronic_diseases} onChange={handleChange} placeholder="Örn: Diyabet Tip 2, Hipertansiyon"></textarea></div>
              <div className="col-12"><label htmlFor="family_history" className="form-label">Aile Öyküsü</label><textarea className="form-control" id="family_history" name="family_history" rows="2" value={profileData.family_history} onChange={handleChange} placeholder="Örn: Annede tiroid, babada kalp hastalığı"></textarea></div>
              <div className="col-md-4"><label htmlFor="smoking_status" className="form-label">Sigara Kullanımı</label><select className="form-select" id="smoking_status" name="smoking_status" value={profileData.smoking_status} onChange={handleChange}><option value="">Seçiniz...</option><option value="Kullanmıyor">Kullanmıyor</option><option value="Bıraktı">Bıraktı</option><option value="Kullanıyor">Kullanıyor</option></select></div>
              <div className="col-md-4"><label htmlFor="alcohol_status" className="form-label">Alkol Kullanımı</label><select className="form-select" id="alcohol_status" name="alcohol_status" value={profileData.alcohol_status} onChange={handleChange}><option value="">Seçiniz...</option><option value="Kullanmıyor">Kullanmıyor</option><option value="Sosyal">Sosyal</option><option value="Düzenli">Düzenli</option></select></div>
              <div className="col-md-4"><label htmlFor="pregnancy_status" className="form-label">Hamilelik Durumu</label><select className="form-select" id="pregnancy_status" name="pregnancy_status" value={profileData.pregnancy_status} onChange={handleChange}><option value="">Seçiniz...</option><option value="Yok">Yok</option><option value="Hamile">Hamile</option><option value="Emziriyor">Emziriyor</option></select></div>
              
              {message && <div className={`alert mt-3 ${message.includes('başarıyla') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
              <div className="col-12 d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-primary">Bilgileri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
        
        <IlacYonetimi />
        <BildirimAyarlari />
    </div>
  );
}

export default Profile;
