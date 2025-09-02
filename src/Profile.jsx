import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked'; // İlaç bilgisi için

// --- YENİ TASARIM: İlaçlar için Modal (Açılır Pencere) Bileşeni ---
const MedicationModal = ({ med, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    quantity: '',
    times: '',
    notes: '',
  });

  useEffect(() => {
    if (med) {
      setFormData({
        name: med.name || '',
        dosage: med.dosage || '',
        quantity: med.quantity || '',
        times: med.times || '',
        notes: med.notes || '',
      });
    } else {
      setFormData({ name: '', dosage: '', quantity: '', times: '', notes: '' });
    }
  }, [med]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeInputs = (e, index) => {
    const newTimes = formData.times.split(',').map(t => t.trim());
    newTimes[index] = e.target.value;
    setFormData(prev => ({ ...prev, times: newTimes.join(', ') }));
  };
  
  const handleFrequencyChange = (e) => {
      const count = parseInt(e.target.value, 10);
      const newTimes = Array(count).fill("").join(', ');
      setFormData(prev => ({...prev, times: newTimes}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, med ? med.id : null);
  };
  
  const frequency = formData.times.split(',').length;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{med ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">İlaç Adı</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Örn: Parol" required />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Dozaj</label>
                  <input type="text" name="dosage" value={formData.dosage} onChange={handleChange} className="form-control" placeholder="Örn: 500 mg" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Miktar</label>
                  <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control" placeholder="Örn: 1 tablet" required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Günde Kaç Kez?</label>
                <select className="form-select" value={frequency} onChange={handleFrequencyChange}>
                    {[1, 2, 3, 4].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>
              <div className="row">
                {formData.times.split(',').map((time, index) => (
                    <div className="col-md-6 mb-3" key={index}>
                        <label className="form-label">{index + 1}. Saat</label>
                        <input type="time" value={time.trim()} onChange={(e) => handleTimeInputs(e, index)} className="form-control" required />
                    </div>
                ))}
              </div>
              <div className="mb-3">
                <label className="form-label">Notlar (İsteğe Bağlı)</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="form-control" placeholder="Örn: Tok karnına alınacak" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
              <button type="submit" className="btn btn-primary">Kaydet</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- YENİ TASARIM: İlaç Bilgisi için Modal ---
const InfoModal = ({ title, content, onClose, isLoading }) => {
    const createMarkup = () => {
        if (!content) return { __html: '' };
        return { __html: marked(content) };
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {isLoading ? (
                            <div className="text-center"><span className="spinner-border"></span></div>
                        ) : (
                            <div dangerouslySetInnerHTML={createMarkup()} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


function Profile() {
  const [profileData, setProfileData] = useState({
    date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
    chronic_diseases: '', family_history: '', smoking_status: '',
    alcohol_status: '', pregnancy_status: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // İlaç yönetimi için state'ler
  const [meds, setMeds] = useState([]);
  const [isMedsLoading, setIsMedsLoading] = useState(true);
  const [medError, setMedError] = useState('');
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // İlaç bilgisi için state'ler
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState('');
  const [infoTitle, setInfoTitle] = useState('');
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  
  // Bildirim izni için state
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);


  const fetchProfile = async () => {
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/profile/me/`, { headers: { 'Authorization': `Bearer ${token}` } });
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

  const fetchMeds = async () => {
    setIsMedsLoading(true);
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/medications/`, { headers: { 'Authorization': `Bearer ${token}` } });
      setMeds(response.data);
    } catch (err) {
      setMedError('İlaçlar yüklenirken bir hata oluştu.');
    } finally {
      setIsMedsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMeds();
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
      await axios.post(`${apiUrl}/profile/me/`, dataToSend, { headers: { 'Authorization': `Bearer ${token}` } });
      setMessage('Profil bilgileriniz başarıyla güncellendi!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Güncelleme sırasında bir hata oluştu.');
    }
  };
  
  // --- İLAÇ FONKSİYONLARI ---
  const handleMedSave = async (medData, medId) => {
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiCall = medId 
      ? axios.put(`${apiUrl}/medications/${medId}`, medData, { headers: { 'Authorization': `Bearer ${token}` } })
      : axios.post(`${apiUrl}/medications/`, medData, { headers: { 'Authorization': `Bearer ${token}` } });

    try {
      await apiCall;
      setShowMedModal(false);
      setEditingMed(null);
      fetchMeds(); // Listeyi yenile
    } catch (err) {
      setMedError(medId ? 'İlaç güncellenirken bir hata oluştu.' : 'İlaç eklenirken bir hata oluştu.');
    }
  };

  const handleDeleteMed = async (medId) => {
    if (window.confirm("Bu ilacı kalıcı olarak silmek istediğinizden emin misiniz?")) {
        const token = localStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
            await axios.delete(`${apiUrl}/medications/${medId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchMeds();
        } catch (err) {
            setMedError('İlaç silinirken bir hata oluştu.');
        }
    }
  };
  
  const handleGetMedInfo = async (medName) => {
    setShowInfoModal(true);
    setIsInfoLoading(true);
    setInfoTitle(`${medName} Hakkında Bilgi`);
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
        const response = await axios.get(`${apiUrl}/medication-info/${medName}`, { headers: { 'Authorization': `Bearer ${token}` } });
        setInfoContent(response.data.info);
    } catch (err) {
        setInfoContent('Bu ilaç hakkında bilgi alınırken bir hata oluştu.');
    } finally {
        setIsInfoLoading(false);
    }
  };

  const handleRequestNotificationPermission = () => {
    Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
    });
  };

  if (isLoading) {
    return <div className="text-center mt-5"><span className="spinner-border"></span> Profil yükleniyor...</div>;
  }

  return (
    <div>
      {showMedModal && <MedicationModal med={editingMed} onSave={handleMedSave} onClose={() => { setShowMedModal(false); setEditingMed(null); }} />}
      {showInfoModal && <InfoModal title={infoTitle} content={infoContent} onClose={() => setShowInfoModal(false)} isLoading={isInfoLoading} />}

      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">Profilim ve Ayarlar</span>
          <div>
            <Link to="/" className="btn btn-outline-secondary">Ana Sayfa</Link>
          </div>
        </div>
      </nav>

      <div className="row g-4">
        {/* Sol Sütun: Kişisel Bilgiler */}
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Kişisel Bilgiler</h5>
              <form onSubmit={handleSave} className="row g-3">
                <div className="col-md-6"><label className="form-label">Doğum Tarihi</label><input type="date" className="form-control" name="date_of_birth" value={profileData.date_of_birth} onChange={handleChange} /></div>
                <div className="col-md-6"><label className="form-label">Cinsiyet</label><select className="form-select" name="gender" value={profileData.gender} onChange={handleChange}><option value="">Seçiniz...</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option></select></div>
                <div className="col-md-6"><label className="form-label">Boy (cm)</label><input type="number" className="form-control" name="height_cm" value={profileData.height_cm} onChange={handleChange} placeholder="175"/></div>
                <div className="col-md-6"><label className="form-label">Kilo (kg)</label><input type="number" className="form-control" name="weight_kg" value={profileData.weight_kg} onChange={handleChange} placeholder="70"/></div>
                <div className="col-12"><label className="form-label">Bilinen Kronik Hastalıklar</label><textarea className="form-control" name="chronic_diseases" rows="2" value={profileData.chronic_diseases} onChange={handleChange} placeholder="Diyabet Tip 2, Hipertansiyon"></textarea></div>
                <div className="col-md-4"><label className="form-label">Sigara</label><select className="form-select" name="smoking_status" value={profileData.smoking_status} onChange={handleChange}><option value="">Seçiniz</option><option value="Kullanmıyor">Kullanmıyor</option><option value="Bıraktı">Bıraktı</option><option value="Kullanıyor">Kullanıyor</option></select></div>
                <div className="col-md-4"><label className="form-label">Alkol</label><select className="form-select" name="alcohol_status" value={profileData.alcohol_status} onChange={handleChange}><option value="">Seçiniz</option><option value="Kullanmıyor">Kullanmıyor</option><option value="Sosyal">Sosyal</option><option value="Düzenli">Düzenli</option></select></div>
                {profileData.gender === 'Kadın' && (
                  <div className="col-md-4"><label className="form-label">Hamilelik</label><select className="form-select" name="pregnancy_status" value={profileData.pregnancy_status} onChange={handleChange}><option value="">Seçiniz</option><option value="Yok">Yok</option><option value="Hamile">Hamile</option><option value="Emziriyor">Emziriyor</option></select></div>
                )}
                {message && <div className="col-12 alert alert-success mt-3">{message}</div>}
                <div className="col-12 d-flex justify-content-end mt-3">
                  <button type="submit" className="btn btn-primary">Bilgileri Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sağ Sütun: İlaç ve Ayarlar */}
        <div className="col-lg-5">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">İlaçlarım</h5>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingMed(null); setShowMedModal(true); }}>+ Yeni Ekle</button>
            </div>
            <div className="card-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
              {medError && <div className="alert alert-danger">{medError}</div>}
              {isMedsLoading ? <p>Yükleniyor...</p> : meds.length === 0 ? <p className="text-muted">Kayıtlı ilacınız yok.</p> : (
                <ul className="list-group list-group-flush">
                  {meds.map(med => (
                    <li key={med.id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div className="me-auto">
                        <div className="fw-bold">{med.name}</div>
                        <small>{med.dosage} - {med.quantity}</small>
                        <br/>
                        <small className="text-muted">Saat: {med.times}</small>
                      </div>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-info" title="Bilgi Al" onClick={() => handleGetMedInfo(med.name)}>i</button>
                        <button className="btn btn-sm btn-outline-secondary" title="Düzenle" onClick={() => { setEditingMed(med); setShowMedModal(true); }}>✎</button>
                        <button className="btn btn-sm btn-outline-danger" title="Sil" onClick={() => handleDeleteMed(med.id)}>🗑</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Bildirim Ayarları</h5></div>
            <div className="card-body">
                {notificationPermission === 'granted' && <p className="text-success">İlaç hatırlatmaları için bildirimlere izin verdiniz.</p>}
                {notificationPermission === 'denied' && <p className="text-danger">Bildirimleri engellediniz. Hatırlatma alamazsınız. Ayarı tarayıcınızdan değiştirebilirsiniz.</p>}
                {notificationPermission === 'default' && (
                    <>
                        <p>İlaç hatırlatmaları almak için bildirimlere izin verin.</p>
                        <button className="btn btn-success" onClick={handleRequestNotificationPermission}>Bildirimlere İzin Ver</button>
                    </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

