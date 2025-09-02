import React from 'react';
import { Link } from 'react-router-dom';

function TermsOfService() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{maxWidth: '800px'}}>
        <h3 className="text-center mb-4">Kullanım Koşulları ve Sorumluluk Reddi</h3>
        
        <p className="fw-bold text-danger text-center">
          YASAL UYARI: Bu metin yalnızca bilgilendirme amaçlıdır. Profesyonel bir tıbbi tavsiye, teşhis veya tedavi yerine geçmez.
        </p>

        <hr/>

        <h5>1. Tıbbi Tavsiye Niteliği Taşımaz</h5>
        <p>
          Uygulama ve yapay zeka asistanı "Mia" tarafından sağlanan tüm içerikler yalnızca bilgilendirme ve eğitim amaçlıdır. Sağlanan hiçbir bilgi, profesyonel bir tıbbi tavsiye, teşhis veya tedavi yerine geçmez.
        </p>

        <h5>2. Acil Durumlar İçin Kullanılamaz</h5>
        <p>
          Bu uygulama, acil tıbbi durumlar için tasarlanmamıştır. Eğer acil bir sağlık sorununuz olduğunu düşünüyorsanız, derhal <strong>112 Acil Servis'i arayın</strong> veya en yakın acil yardım merkezine başvurun.
        </p>
        
        <h5>3. Doktor-Hasta İlişkisi Kurulmaz</h5>
        <p>
          Uygulamayı kullanmanız, sizinle Miacore Health veya yapay zeka asistanı Mia arasında bir doktor-hasta ilişkisi kurmaz.
        </p>

        <h5>4. Kullanıcı Sorumluluğu</h5>
        <p>
          Sağlığınızla ilgili tüm kararlar sizin sorumluluğunuzdadır. Herhangi bir sağlık sorunu veya endişeniz için mutlaka kalifiye bir sağlık profesyoneline danışmalısınız.
        </p>

        <h5>5. Bilgilerin Doğruluğu ve Sınırlılıklar</h5>
        <p>
          Yapay zeka teknolojisi hatalar yapabilir. Sunulan bilgilerin doğruluğu konusunda hiçbir garanti verilmemektedir. Tüm bilgiler "olduğu gibi" sunulmaktadır.
        </p>

        <div className="text-center mt-4">
            <Link to="/register" className="btn btn-primary" style={{width: 'auto'}}>Anladım, Geri Dön</Link>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;

