import { useGoogleLogin } from '@react-oauth/google';
import { ShieldCheck, MapPin, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthProps {
  onSuccess: (response: any) => void;
  error?: string | null;
}

export default function Auth({ onSuccess, error }: AuthProps) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Kita perlu mengambil data user menggunakan access_token karena useGoogleLogin
      // memberikan token akses, bukan ID Token (JWT) secara langsung.
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
      .then(res => res.json())
      .then(profile => {
        // Kita kirim profil ini ke handleLoginSuccess di App.tsx
        onSuccess({ 
          credential: profile, // Kita kirim profile langsung
          isCustomFlow: true 
        });
      });
    },
    onError: () => console.log('Login Failed'),
    prompt: 'select_account', // INI KUNCINYA: Memaksa muncul pilihan email
  });

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
        
        <h1 className="text-gradient" style={{ fontSize: '56px', marginBottom: '16px', letterSpacing: '-2px' }}>Absensi Online</h1>
        <p className="text-muted" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.6' }}>
          Platform presensi digital modern dengan verifikasi lokasi GPS dan keamanan tingkat tinggi untuk instansi Anda.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '80px' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--p)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '32px' }}>Masuk ke Sistem</h2>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid #ef4444', 
                  color: '#ef4444', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  marginBottom: '20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {error}
              </motion.div>
            )}

            <button 
              onClick={() => login()}
              className="btn"
              style={{ 
                width: '100%',
                background: 'white',
                color: '#111',
                borderRadius: '50px',
                padding: '16px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="24" alt="G" />
              Masuk dengan Google
            </button>

            <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--muted)' }}>
              Selalu meminta pilihan akun untuk keamanan ekstra.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '32px' }}>Fitur Utama</h2>
          <div style={{ width: '48px', height: '4px', background: 'var(--p)', margin: '16px auto', borderRadius: '2px' }}></div>
        </div>

        <div className="grid-2">
          <div className="glass-card">
            <div className="text-p" style={{ marginBottom: '20px' }}><MapPin size={32}/></div>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>GPS Verifikasi</h3>
            <p className="text-muted" style={{ lineHeight: '1.6' }}>Memastikan kehadiran hanya bisa dilakukan di area kantor yang ditentukan.</p>
          </div>
          
          <div className="glass-card">
            <div className="text-p" style={{ marginBottom: '20px' }}><QrCode size={32}/></div>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>QR Code System</h3>
            <p className="text-muted" style={{ lineHeight: '1.6' }}>Sistem scan yang cepat dan akurat untuk meminimalisir kecurangan.</p>
          </div>

          <div className="glass-card">
            <div className="text-p" style={{ marginBottom: '20px' }}><ShieldCheck size={32}/></div>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Data Terenkripsi</h3>
            <p className="text-muted" style={{ lineHeight: '1.6' }}>Seluruh data absensi disimpan secara aman di Database Cloudflare D1.</p>
          </div>
        </div>

        <div style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '64px' }}>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '32px' }}>
            <a href="/privacy/" className="text-muted" style={{ textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
            <a href="/terms/" className="text-muted" style={{ textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', opacity: 0.6 }}>
            © 2024 Absensi Online - PRSNSI System.
          </p>
        </div>
      </div>
    </div>
  );
}
