import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle, StopCircle, Upload } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraId = "qr-reader";

  useEffect(() => {
    qrRef.current = new Html5Qrcode(cameraId);
    return () => {
      if (qrRef.current?.isScanning) {
        qrRef.current.stop().then(() => qrRef.current?.clear());
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setError(null);
      if (qrRef.current) {
        await qrRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => {}
        );
        setIsScanning(true);
      }
    } catch (err) {
      setError("Gagal mengakses kamera. Silakan gunakan fitur Upload Gambar di bawah.");
    }
  };

  const stopScanner = async () => {
    if (qrRef.current && qrRef.current.isScanning) {
      await qrRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !qrRef.current) return;

    try {
      setError(null);
      const decodedText = await qrRef.current.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      setError("QR Code tidak terbaca dalam gambar ini.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', padding: '16px', borderRadius: '20px', marginBottom: '24px' }}>
          <Camera size={32} color="var(--p)" />
        </div>
        
        <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Scan QR Kantor</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px', maxWidth: '300px' }}>
          Gunakan kamera atau upload gambar QR Code untuk melakukan absensi.
        </p>

        <div style={{ width: '100%', position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '2px solid rgba(99,102,241,0.2)', background: '#000', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div id={cameraId} style={{ width: '100%' }}></div>
          {!isScanning && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', gap: '16px' }}>
               <button onClick={startScanner} className="btn btn-p" style={{ width: '220px' }}>
                  <Camera size={20} /> Mulai Kamera
               </button>
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 className="btn" 
                 style={{ 
                   width: '220px', 
                   background: 'rgba(255,255,255,0.1)', 
                   border: '1px solid rgba(255,255,255,0.2)',
                   color: 'white',
                   backdropFilter: 'none' // Ensure no performance hit
                 }}
               >
                  <Upload size={20} /> Upload Gambar
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
            </div>
          )}
        </div>

        {isScanning && (
          <button onClick={stopScanner} className="btn" style={{ marginTop: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', width: '100%' }}>
            <StopCircle size={20} /> Berhenti Memindai
          </button>
        )}

        {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '16px', fontWeight: 700 }}>{error}</p>}

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', textAlign: 'left' }}>
          <AlertCircle size={20} color="var(--p)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
            Pastikan gambar QR Code terlihat jelas dan Anda berada dalam radius kantor yang ditentukan.
          </p>
        </div>
      </div>
    </div>
  );
}
