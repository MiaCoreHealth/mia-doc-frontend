import React, { useState, useEffect } from 'react';
import axios from 'axios';
// addHours fonksiyonuna artık ihtiyacımız olmadığı için silebiliriz.
import { format } from 'date-fns';

function History() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('Geçmiş raporlar yükleniyor...');
  // Silme onayı için yeni state'ler
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');


  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setMessage('Geçmişi görmek için giriş yapmalısınız.');
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL;
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
    fetchHistory();
  }, []);

  const handleDeleteRequest = (reportId) => {
    setReportToDelete(reportId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    const token = localStorage.getItem('userToken');
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      await axios.delete(`${apiUrl}/reports/${reportToDelete}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReports(prevReports => prevReports.filter(report => report.id !== reportToDelete));
    } catch (error) {
      setDeleteMessage("Rapor silinirken bir hata oluştu.");
      // Hata mesajını 3 saniye sonra temizle
      setTimeout(() => setDeleteMessage(''), 3000);
    } finally {
        // Modal'ı kapat
        setShowConfirmModal(false);
        setReportToDelete(null);
    }
  };

  // DÜZELTİLMİŞ FONKSİYON
  const formatToLocalTime = (utcDateString) => {
    // new Date() UTC tarihini otomatik olarak tarayıcının yerel saatine çevirir.
    const localDate = new Date(utcDateString);
    // format() bu yerel tarihi istediğimiz formatta string'e dönüştürür.
    return format(localDate, "dd MMMM yyyy, HH:mm:ss");
  };

  return (
    <div className="mt-5">
      <h3 className="mb-3">Geçmiş Raporlarım</h3>
      {message && <p className="text-muted">{message}</p>}
      {deleteMessage && <div className="alert alert-danger">{deleteMessage}</div>}
      
      <div className="accordion" id="reportHistoryAccordion">
        {reports.map((report, index) => (
          <div className="accordion-item" key={report.id}>
            <h2 className="accordion-header" id={`heading-${report.id}`}>
              <button className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${report.id}`} aria-expanded={index === 0} aria-controls={`#collapse-${report.id}`}>
                <span className="fw-bold">{report.original_filename}</span>
                <span className="ms-auto text-muted small me-2">{formatToLocalTime(report.upload_date)}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); handleDeleteRequest(report.id); }}>Sil</button>
              </button>
            </h2>
            <div id={`collapse-${report.id}`} className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} aria-labelledby={`heading-${report.id}`} data-bs-parent="#reportHistoryAccordion">
              <div className="accordion-body" style={{ whiteSpace: 'pre-wrap' }}>{report.analysis_result}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Silme Onay Modalı */}
      {showConfirmModal && (
        <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Raporu Sil</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Bu raporu kalıcı olarak silmek istediğinizden emin misiniz?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>İptal</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Evet, Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;