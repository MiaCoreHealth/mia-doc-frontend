import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="text-center text-muted mt-auto mb-3 pt-4 border-top">
      <small>
        &copy; 2025 Miacore Health. Tüm hakları saklıdır. | <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
      </small>
    </footer>
  );
}

export default Footer;

