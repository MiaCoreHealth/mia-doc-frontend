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
    if (!currentWeight || isNaN(currentWeight)) {
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
      fetchWeightHistory(); // Grafiği güncelle
    } catch (err) {
      setError('Kilo eklenirken bir hata oluştu.');
    }
  };

  const chartData = {
    labels: weightHistory.map(entry => new Date(entry.entry_date).toLocaleDateString('tr-TR')),
    datasets: [
      {
        label: 'Kilo (kg)',
        data: weightHistory.map(entry => entry.weight_kg),
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Kilo Değişim Grafiği'
      }
    }
  };

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        {isLoading ? <p>Grafik yükleniyor...</p> : (
            weightHistory.length > 0 ? <Line options={chartOptions} data={chartData} /> : <p className="text-center text-muted">Grafiği görmek için en az bir kilo verisi eklemelisiniz.</p>
        )}
        <form onSubmit={handleAddWeight} className="mt-3">
          <div className="input-group">
            <input 
              type="number" 
              step="0.1"
              className="form-control" 
              placeholder="Bugünkü kilonuzu girin (örn: 75.5)" 
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
            />
            <button className="btn btn-success" type="submit">Ekle</button>
          </div>
          {error && <small className="text-danger mt-1 d-block">{error}</small>}
        </form>
      </div>
    </div>
  );
};

export default WeightTracker;
