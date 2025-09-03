import axios from 'axios';

// Yeni bir axios örneği oluşturuyoruz. Artık tüm istekler buradan geçecek.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 1. İstek Gönderilmeden Önce: Jetonu Otomatik Ekle
// Bu fonksiyon, her istek gönderilmeden önce araya girer.
api.interceptors.request.use(
  (config) => {
    // Tarayıcı hafızasından jetonu (token) al.
    const token = localStorage.getItem('userToken');
    // Eğer jeton varsa, isteğin başlığına (headers) ekle.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // İstek gönderilirken bir hata olursa, bu hatayı geri döndür.
    return Promise.reject(error);
  }
);

// 2. Cevap Geldikten Sonra: Hataları Kontrol Et
// Bu fonksiyon, sunucudan bir cevap geldikten sonra araya girer.
api.interceptors.response.use(
  // Başarılı bir cevap gelirse (örn: 200 OK), hiçbir şey yapma ve cevabı olduğu gibi ilet.
  (response) => {
    return response;
  },
  // Hatalı bir cevap gelirse (örn: 401 Unauthorized), bu fonksiyon çalışır.
  (error) => {
    // Eğer gelen hata "401 Yetkin Yok" hatası ise...
    if (error.response && error.response.status === 401) {
      // Süresi dolmuş jetonu tarayıcı hafızasından sil.
      localStorage.removeItem('userToken');
      // Kullanıcıyı bilgilendirerek giriş sayfasına yönlendir.
      // Not: alert yerine daha şık bir bildirim kütüphanesi de kullanılabilir.
      alert('Oturumunuzun süresi doldu. Güvenliğiniz için lütfen tekrar giriş yapın.');
      // Sayfanın konumunu /login olarak değiştirerek yönlendirmeyi yap.
      window.location.href = '/login';
    }
    // Eğer hata 401 değilse, hatayı normal şekilde geri döndür.
    return Promise.reject(error);
  }
);

export default api;
