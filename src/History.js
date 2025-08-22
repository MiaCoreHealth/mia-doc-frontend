// frontend/src/History.js

import React, 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addHours } from 'date-fns';

function History() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('Geçmiş raporlar yükleniyor...');

  const fetchHistory = async () => {
    // ... (fetchHistory fonksiyonu aynı, değişiklik yok)
    const token = localStorage.getItem('userToken');
    if (!token) {
      setMessage('Geçmişi görmek için giriş yapmalısınız.');
      return;
    }
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/reports/history/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.length === 0) {
        setMessage('Henüz analiz edilmiş bir raporunuz bulunmuyor.');
      } else {
        setReports(response.data);
        setMessage('');
      }
    } catch (error) {
      setMessage('Rapor geçmişi yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatToLocalTime = (utcDateString) => {
    // ... (formatToLocalTime fonksiyonu aynı, değişiklik yok)
    const date = new Date(utcDateString);
    const localDate = addHours(date, 3);
    return format(localDate, "dd MMMM yyyy, HH:mm:ss");
  };

  // YENİ: Silme işlemini yapan fonksiyon
  const handleDelete = async (reportId) => {
    // Kullanıcıya silmek istediğinden emin olup olmadığını soruyoruz
    const isConfirmed = window.confirm("Bu raporu kalıcı olarak silmek istediğinizden emin misiniz?");
    
    if (isConfirmed) {
      const token = localStorage.getItem('userToken');
      const apiUrl = process.env.REACT_APP_API_URL;
      try {
        // Backend'deki silme endpoint'ine DELETE isteği gönderiyoruz
        await axios.delete(`${apiUrl}/reports/${reportId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Başarılı olursa, sildiğimiz raporu ekrandaki listeden de kaldırıyoruz
        setReports(prevReports => prevReports.filter(report => report.id !== reportId));
        
      } catch (error) {
        alert("Rapor silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h3 className="mb-3">Geçmiş Raporlarım</h3>
      {message && <p className="text-muted">{message}</p>}
      
      <div className="accordion" id="reportHistoryAccordion">
        {reports.map((report, index) => (
          <div className="accordion-item" key={report.id}>
            <h2 className="accordion-header" id={`heading-${report.id}`}>
              <button 
                className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target={`#collapse-${report.id}`} 
                aria-expanded={index === 0} 
                aria-controls={`#collapse-${report.id}`}
              >
                <span className="fw-bold">{report.original_filename}</span>
                <span className="ms-auto text-muted small me-2">{formatToLocalTime(report.upload_date)}</span>
                
                {/* YENİ: Sil butonu */}
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation(); // Butonun akordiyonu açıp kapatmasını engelle
                    handleDelete(report.id);
                  }}
                >
                  Sil
                </button>
              </button>
            </h2>
            <div 
              id={`collapse-${report.id}`} 
              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
              aria-labelledby={`heading-${report.id}`} 
              data-bs-parent="#reportHistoryAccordion"
            >
              <div className="accordion-body" style={{ whiteSpace: 'pre-wrap' }}>
                {report.analysis_result}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;