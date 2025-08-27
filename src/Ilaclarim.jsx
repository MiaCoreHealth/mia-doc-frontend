import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Ilaclarim({ handleLogout }) {
  const [meds, setMeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Yeni ilaç ekleme formu için state'ler
  const [showForm, setShowForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });

  // İlaçları getiren fonksiyon
  const fetchMeds = async () => {
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/medications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    setNewMed(prevState => ({ ...prevState, [name]: value }));
  };

  // Yeni ilaç ekleme fonksiyonu
  const handleAddMed = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      await axios.post(`${apiUrl}/medications/`, newMed, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Formu temizle ve listeyi yenile
      setNewMed({ name: '', dosage: '', frequency: '', notes: '' });
      setShowForm(false);
      fetchMeds(); // Listeyi yeniden çek
    } catch (err) {
      setError('İlaç eklenirken bir hata oluştu.');
    }
  };
  
  // İlaç silme fonksiyonu
  const handleDeleteMed = async (medId) => {
    if (window.confirm("Bu ilacı silmek istediğinizden emin misiniz?")) {
        const token = localStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
            await axios.delete(`${apiUrl}/medications/${medId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMeds(); // Listeyi yeniden çek
        } catch (err) {
            setError('İlaç silinirken bir hata oluştu.');
        }
    }
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light rounded mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">İlaçlarım</span>
          <div>
            <Link to="/" className="btn btn-outline-secondary me-2">Ana Sayfa</Link>
            <button onClick={handleLogout} className="btn btn-outline-danger">Çıkış Yap</button>
          </div>
        </div>
      </nav>

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Kayıtlı İlaç Listesi</h5>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Formu Kapat' : 'Yeni İlaç Ekle'}
          </button>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Yeni İlaç Ekleme Formu */}
          {showForm && (
            <form onSubmit={handleAddMed} className="mb-4 p-3 border rounded">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">İlaç Adı</label>
                  <input type="text" name="name" value={newMed.name} onChange={handleInputChange} className="form-control" placeholder="Örn: Parol" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Dozaj</label>
                  <input type="text" name="dosage" value={newMed.dosage} onChange={handleInputChange} className="form-control" placeholder="Örn: 500 mg" required />
                </div>
                <div className="col-12">
                  <label className="form-label">Kullanım Sıklığı</label>
                  <input type="text" name="frequency" value={newMed.frequency} onChange={handleInputChange} className="form-control" placeholder="Örn: Günde 2 kez, sabah-akşam" required />
                </div>
                <div className="col-12">
                  <label className="form-label">Notlar (İsteğe Bağlı)</label>
                  <input type="text" name="notes" value={newMed.notes} onChange={handleInputChange} className="form-control" placeholder="Örn: Tok karnına alınacak" />
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success">İlacı Kaydet</button>
                </div>
              </div>
            </form>
          )}

          {/* İlaç Listesi */}
          {isLoading ? (
            <p>İlaçlar yükleniyor...</p>
          ) : meds.length === 0 ? (
            <p className="text-muted">Henüz kayıtlı bir ilacınız bulunmuyor.</p>
          ) : (
            <ul className="list-group">
              {meds.map(med => (
                <li key={med.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="my-0">{med.name}</h6>
                    <small className="text-muted">{med.dosage} - {med.frequency}</small>
                    {med.notes && <small className="d-block text-info">Not: {med.notes}</small>}
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMed(med.id)}>Sil</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ilaclarim;
