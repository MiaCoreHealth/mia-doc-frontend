import React, { useState, useEffect } from 'react';
import api from './api'; // DEĞİŞİKLİK
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Bileşenin geri kalanı aynı, sadece 'axios' yerine 'api' kullanılıyor.

function WeightTracker() {
  const [entries, setEntries] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [message, setMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const fetchWeightHistory = async () => {
    try {
      const response = await api.get('/weight-entries/'); // DEĞİŞİKLİK
      setEntries(response.data);
    } catch (error) {
      setMessage('Kilo geçmişi yüklenirken bir hata oluştu.');
    }
  };
  useEffect(() => { fetchWeightHistory(); }, []);
  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!currentWeight || parseFloat(currentWeight) <= 0) {
      setMessage('Lütfen geçerli bir kilo girin.');
      return;
    }
    try {
      await api.post('/weight-entries/', { weight_kg: parseFloat(currentWeight) }); // DEĞİŞİKLİK
      setCurrentWeight('');
      setMessage('Kilonuz başarıyla eklendi!');
      fetchWeightHistory();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Kilo eklenirken bir hata oluştu.');
    }
  };
  const handleDeleteWeight = async (entryId) => {
    if (window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
      try {
        await api.delete(`/weight-entries/${entryId}`); // DEĞİŞİKLİK
        fetchWeightHistory();
      } catch (error) {
        setMessage('Kayıt silinirken bir hata oluştu.');
      }
    }
  };

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const chartData = {
    labels: entries.map(e => new Date(e.date).toLocaleDateString('tr-TR')),
    datasets: [{
      label: 'Kilo (kg)',
      data: entries.map(e => e.weight_kg),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.2
    }]
  };
  return (
    <div>
      <div className="text-center mb-3">
        <h6 className="text-muted mb-1">Güncel Kilonuz</h6>
        <h3 className="fw-bold">{latestEntry ? `${latestEntry.weight_kg} kg` : 'N/A'}</h3>
      </div>
      <form onSubmit={handleAddWeight} className="d-flex gap-2">
        <input type="number" step="0.1" className="form-control form-control-sm" placeholder="Örn: 85.5" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">Ekle</button>
      </form>
      {message && <div className="text-center text-success small mt-2">{message}</div>}
      <div className="text-center mt-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Detayları Gizle' : 'Detayları Göster'}
        </button>
      </div>
      <div className={showDetails ? 'collapse show mt-3' : 'collapse mt-3'}>
        {entries.length > 0 ? (
            <>
                <h6 className="text-center mb-3">Kilo Değişim Grafiği</h6>
                <Line data={chartData} />
                <h6 className="text-center mt-4 mb-2">Geçmiş Kayıtlar</h6>
                <ul className="list-group list-group-flush" style={{maxHeight: '150px', overflowY: 'auto'}}>
                    {entries.slice().reverse().map(entry => (
                        <li key={entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                           <span><strong>{entry.weight_kg} kg</strong> - {new Date(entry.date).toLocaleDateString('tr-TR')}</span>
                           <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteWeight(entry.id)}>Sil</button>
                        </li>
                    ))}
                </ul>
            </>
        ) : <p className="text-center text-muted mt-3">Grafiği görmek için kilo kaydı ekleyin.</p>}
      </div>
    </div>
  );
}

export default WeightTracker;
