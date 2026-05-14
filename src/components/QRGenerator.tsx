import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { QrCode, RefreshCcw, Download } from 'lucide-react';

export default function QRGenerator() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const newToken = `absensi-${new Date().toDateString()}-${Math.random().toString(36).substr(2, 9)}`;
    setToken(newToken);
  }, []);

  const refreshQRCode = () => {
    const newToken = `absensi-${new Date().toDateString()}-${Math.random().toString(36).substr(2, 9)}`;
    setToken(newToken);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-gen-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-Absensi-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', width: '100%' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '12px' }}><QrCode color="var(--p)" size={20} /></div>
        <h3 style={{ fontWeight: 900 }}>QR Absensi Hari Ini</h3>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', display: 'inline-block', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', marginBottom: '32px' }}>
        {token && <QRCodeCanvas id="qr-gen-canvas" value={token} size={256} level="H" includeMargin={true} />}
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '32px', lineHeight: '1.6' }}>
        Tampilkan kode ini di layar kantor atau cetak untuk dipindai oleh karyawan.
      </p>

      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
        <button onClick={refreshQRCode} className="btn card" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
          <RefreshCcw size={20} /> Reset
        </button>
        <button onClick={downloadQRCode} className="btn btn-p" style={{ flex: 2, padding: '12px', justifyContent: 'center' }}>
          <Download size={20} /> Download Gambar
        </button>
      </div>
    </div>
  );
}
