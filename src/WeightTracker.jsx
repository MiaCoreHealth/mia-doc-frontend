import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightTracker = () => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const fetchWeightHistory = async () => {
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/weight-entries/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWeightHistory(response.data);
    } catch (err) {
      setError('Kilo geçmişi yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightHistory();
  }, []);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!currentWeight || isNaN(currentWeight) || currentWeight <= 0) {
      setError('Lütfen geçerli bir kilo değeri girin.');
      return;
    }
    setError('');
    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      await axios.post(`${apiUrl}/weight-entries/`, { weight_kg: parseFloat(currentWeight) }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentWeight('');
      fetchWeightHistory();
    } catch (err) {
      setError('Kilo eklenirken bir hata oluştu.');
    }
  };

  const handleDeleteWeight = async (entryId) => {
    if (window.confirm("Bu kilo kaydını silmek istediğinizden emin misiniz?")) {
        const token = localStorage.getItem('userToken');
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
            await axios.delete(`${apiUrl}/weight-entries/${entryId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchWeightHistory(); // Listeyi ve grafiği güncelle
        } catch (err) {
            setError('Kayıt silinirken bir hata oluştu.');
        }
    }
  };

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight_kg : null;

  const chartData = {
    labels: weightHistory.map(entry => new Date(entry.entry_date).toLocaleDateString('tr-TR')),
    datasets: [{ label: 'Kilo (kg)', data: weightHistory.map(entry => entry.weight_kg), fill: true, backgroundColor: 'rgba(75,192,192,0.2)', borderColor: 'rgba(75,192,192,1)', tension: 0.1 }]
  };
  
  const chartOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Kilo Değişim Grafiği' } } };

  return (
    <div className="mt-4">
        <h5 className="card-title text-center mb-3">Kilo Takibi</h5>
        <div className="row align-items-center">
            <div className="col-md-6 text-center mb-3 mb-md-0">
                <h6 className="text-muted">Güncel Kilonuz</h6>
                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 
                    <span className="display-5 fw-bold">{latestWeight ? `${latestWeight} kg` : 'N/A'}</span>
                }
            </div>
            <div className="col-md-6">
                <form onSubmit={handleAddWeight}>
                    <label className="form-label small text-muted">Bugünkü kilonuzu ekleyin</label>
                    <div className="input-group">
                        <input type="number" step="0.1" className="form-control" placeholder="Örn: 75.5" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
                        <button className="btn btn-success" type="submit">Ekle</button>
                    </div>
                    {error && <small className="text-danger mt-1 d-block">{error}</small>}
                </form>
            </div>
        </div>
        
        {weightHistory.length > 0 && (
            <div className="text-center mt-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsDetailsVisible(!isDetailsVisible)}>
                    {isDetailsVisible ? 'Detayları Gizle' : 'Geçmişi ve Grafiği Göster'}
                </button>
            </div>
        )}

        {isDetailsVisible && (
            <div className="mt-4">
                <hr />
                <h6>Kilo Değişim Grafiği</h6>
                <Line options={chartOptions} data={chartData} />
                <h6 className="mt-4">Geçmiş Kayıtlar</h6>
                <ul className="list-group list-group-flush">
                    {weightHistory.slice().reverse().map(entry => (
                        <li key={entry.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                <strong>{entry.weight_kg} kg</strong> - 
                                <span className="text-muted ms-2">{new Date(entry.entry_date).toLocaleString('tr-TR')}</span>
                            </span>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteWeight(entry.id)}>Sil</button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
  );
};

export default WeightTracker;
