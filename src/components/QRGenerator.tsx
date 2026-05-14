import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { QrCode, RefreshCcw } from 'lucide-react';

export default function QRGenerator() {
  const [token, setToken] = useState('');

  useEffect(() => {
    // Generate a unique token for the day or session
    const newToken = `absensi-${new Date().toDateString()}-${Math.random().toString(36).substr(2, 9)}`;
    setToken(newToken);
  }, []);

  const refreshQRCode = () => {
    const newToken = `absensi-${new Date().toDateString()}-${Math.random().toString(36).substr(2, 9)}`;
    setToken(newToken);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', width: '100%' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '12px' }}><QrCode color="var(--p)" size={20} /></div>
        <h3 style={{ fontWeight: 900 }}>QR Absensi Hari Ini</h3>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', display: 'inline-block', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', marginBottom: '32px' }}>
        {token && <QRCodeSVG value={token} size={200} level="H" includeMargin={true} />}
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '32px', lineHeight: '1.6' }}>
        Tampilkan kode ini di layar kantor atau cetak untuk dipindai oleh karyawan. Kode akan kedaluwarsa setiap hari.
      </p>

      <button onClick={refreshQRCode} className="btn btn-p" style={{ width: '100%' }}>
        <RefreshCcw size={20} /> Perbarui Kode
      </button>
    </div>
  );
}
