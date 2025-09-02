import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';

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
      setFormData({ name: '', dosage: '', quantity: '', times: '08:00', notes: '' });
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
      const newTimes = Array(count).fill("08:00").join(', ');
      setFormData(prev => ({...prev, times: newTimes}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, med ? med.id : null);
  };
  
  const frequency = formData.times.split(',').length || 1;

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
                  <label className="form-label">Her Seferde Alınacak Miktar</label>
                  <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control" placeholder="Örn: 1 tablet" required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Günde Kaç Kez?</label>
                <select className="form-select" value={frequency} onChange={handleFrequencyChange}>
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
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

const InfoModal = ({ title, content, onClose, isLoading }) => {
    const createMarkup = () => {
        if (!content) return { __html: '' };
        return { __html: marked(content) };
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {isLoading ? (
                            <div className="text-center p-4"><span className="spinner-border"></span></div>
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

  const [meds, setMeds] = useState([]);
  const [isMedsLoading, setIsMedsLoading] = useState(true);
  const [medError, setMedError] = useState('');
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState('');
  const [infoTitle, setInfoTitle] = useState('');
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  
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
      fetchMeds(); 
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
          <span className="navbar-brand fw-bold">Profilim</span>
          <div>
            <Link to="/" className="btn btn-outline-secondary">Ana Sayfa</Link>
          </div>
        </div>
      </nav>

      <div className="row g-4">
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

        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">İlaçlarım</h5>
              <button className="btn btn-primary btn-sm py-1 px-2" onClick={() => { setEditingMed(null); setShowMedModal(true); }}>+ Yeni Ekle</button>
            </div>
            <div className="card-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
              {medError && <div className="alert alert-danger">{medError}</div>}
              {isMedsLoading ? <p>Yükleniyor...</p> : meds.length === 0 ? <p className="text-muted small">Kayıtlı ilacınız yok.</p> : (
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
                        <button className="btn btn-sm btn-outline-info d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}} title="Bilgi Al" onClick={() => handleGetMedInfo(med.name)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-lg" viewBox="0 0 16 16"><path d="m9.708 6.075-3.024.379-.108.502.595.108c.387.093.464.232.38.619l-.404 1.88a.5.5 0 1 0 .957.204l.404-1.88c.125-.582.028-.915-.451-1.074l-.595-.108.108-.502 3.024-.379a.5.5 0 0 0 .49-.595c-.078-.467-.36-.582-.687-.582-.326 0-.609.115-.687.582a.5.5 0 0 0 .49.595zM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287z"/></svg>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}} title="Düzenle" onClick={() => { setEditingMed(med); setShowMedModal(true); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg>
                        </button>
                        <button className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}} title="Sil" onClick={() => handleDeleteMed(med.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/></svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card-footer">
                <h6 className="mb-2 small text-muted">Bildirim Ayarları</h6>
                {notificationPermission === 'granted' && <p className="text-success small mb-0">İlaç hatırlatmaları için bildirimlere izin verdiniz.</p>}
                {notificationPermission === 'denied' && <p className="text-danger small mb-0">Bildirimleri engellediniz. Ayarı tarayıcınızdan değiştirebilirsiniz.</p>}
                {notificationPermission === 'default' && (
                    <button className="btn btn-success btn-sm w-100" onClick={handleRequestNotificationPermission}>Bildirimlere İzin Ver</button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
