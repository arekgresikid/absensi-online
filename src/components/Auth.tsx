import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, MapPin, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthProps {
  onSuccess: (response: any) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'white' }}>
      {/* Hero Section */}
      <div style={{ 
        padding: '80px 20px', 
        textAlign: 'center', 
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1c2c 0%, transparent 70%)' 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
        >
          <img src="/logo.png" alt="PRSNSI Logo" style={{ width: '100px', height: '100px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
        </motion.div>
        
        <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-2px' }}>Absensi Online</h1>
        <p style={{ color: 'var(--muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Platform presensi digital modern dengan verifikasi lokasi GPS dan keamanan tingkat tinggi untuk instansi Anda.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', border: '1px solid var(--p)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: 800 }}>Masuk ke Sistem</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin 
                onSuccess={onSuccess} 
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
              />
            </div>
            <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--muted)' }}>
              Dengan masuk, Anda menyetujui Kebijakan Privasi kami.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section for Google Verification */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>Kenapa Memilih Kami?</h2>
          <div style={{ width: '60px', height: '4px', background: 'var(--p)', margin: '0 auto', borderRadius: '2px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ color: 'var(--p)', marginBottom: '20px' }}><MapPin size={32}/></div>
            <h3 style={{ marginBottom: '12px', fontWeight: 800 }}>Geofencing Presisi</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>Verifikasi lokasi real-time memastikan karyawan melakukan absen tepat di area kantor yang telah ditentukan.</p>
          </div>
          
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ color: 'var(--p)', marginBottom: '20px' }}><QrCode size={32}/></div>
            <h3 style={{ marginBottom: '12px', fontWeight: 800 }}>Dual Scan System</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>Mendukung pemindaian langsung lewat kamera maupun unggah gambar QR Code secara manual dari galeri.</p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div style={{ color: 'var(--p)', marginBottom: '20px' }}><ShieldCheck size={32}/></div>
            <h3 style={{ marginBottom: '12px', fontWeight: 800 }}>Keamanan Data</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>Integrasi Google OAuth menjamin keamanan akun dan enkripsi data absensi yang tidak dapat dimanipulasi.</p>
          </div>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '60px' }}>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '32px' }}>
            <a href="/privacy.html" style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
            <a href="/terms.html" style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', opacity: 0.7 }}>
            © 2024 PRSNSI - Absensi Online System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
