import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [profileData, setProfileData] = useState({
    date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
    pregnancy_status: '', smoking_status: '', alcohol_status: '',
    chronic_diseases: '', medications: '', family_history: ''
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
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Profil Bilgilerim</h2>
        <p className="card-text text-muted">Bu bilgiler, yapay zekanın size daha kişisel yorumlar yapmasına yardımcı olacaktır.</p>
        <form onSubmit={handleSave} className="row g-3">
          {/* Form alanları burada... */}
          <div className="col-12 d-flex justify-content-end mt-4">
            <Link to="/" className="btn btn-secondary me-2">Kontrol Paneline Dön</Link>
            <button type="submit" className="btn btn-primary">Bilgileri Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;