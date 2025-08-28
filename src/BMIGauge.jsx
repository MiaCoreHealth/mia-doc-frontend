import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const BMIGauge = ({ bmi }) => {
  if (bmi === null || isNaN(bmi)) {
    return <div className="text-muted">VKİ hesaplanamadı</div>;
  }

  const data = {
    labels: ['Zayıf', 'Normal', 'Fazla Kilolu', 'Obez', 'Boşluk'],
    datasets: [
      {
        label: 'VKİ Kategorileri',
        data: [18.5, 6.5, 5, 10, 40], // Zayıf, Normal, Fazla Kilolu, Obez aralıkları ve boşluk
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)', // Mavi - Zayıf
          'rgba(75, 192, 192, 0.8)', // Yeşil - Normal
          'rgba(255, 206, 86, 0.8)', // Sarı - Fazla Kilolu
          'rgba(255, 99, 132, 0.8)', // Kırmızı - Obez
          'rgba(201, 203, 207, 0.2)' // Gri - Boşluk
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 2,
        circumference: 180, // Yarım daire
        rotation: 270, // Başlangıç noktası
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    rotation: -90,
    circumference: 180,
    cutout: '60%',
    maintainAspectRatio: false,
  };
  
  // İbrenin pozisyonunu hesapla
  const needleValue = bmi < 10 ? 10 : bmi > 50 ? 50 : bmi;
  const angle = ((needleValue - 10) / 40) * 180; // 10-50 arasını 0-180 dereceye haritala

  return (
    <div style={{ position: 'relative', width: '100%', height: '120px' }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '80%',
          left: '50%',
          transform: `translateX(-50%) translateY(-100%) rotate(${angle}deg)`,
          width: '2px',
          height: '45%',
          backgroundColor: 'black',
          transformOrigin: 'bottom center',
          transition: 'transform 0.5s ease-in-out',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{bmi}</span>
        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>VKİ</div>
      </div>
    </div>
  );
};

export default BMIGauge;
