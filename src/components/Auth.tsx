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
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <div style={{ 
        padding: 'var(--hero-padding, 80px 20px)', 
        textAlign: 'center', 
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1c2c 0%, transparent 70%)' 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
        >
          <img src="/logo.png" alt="PRSNSI Logo" style={{ width: 'min(100px, 20vw)', height: 'min(100px, 20vw)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
        </motion.div>
        
        <h1 className="text-gradient" style={{ fontSize: 'var(--h-size, 48px)', marginBottom: '16px', letterSpacing: '-2px', lineHeight: 1.1 }}>Absensi Online</h1>
        <p className="text-muted" style={{ fontSize: 'clamp(14px, 4vw, 18px)', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.6' }}>
          Platform presensi digital modern dengan verifikasi lokasi GPS dan keamanan tingkat tinggi.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', border: '1px solid var(--p)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Masuk ke Sistem</h2>
            
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
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="20" alt="G" />
              <span style={{ fontWeight: 800 }}>Masuk dengan Google</span>
            </button>

            <p style={{ marginTop: '24px', fontSize: '11px', color: 'var(--muted)' }}>
              Aman & Selalu Verifikasi Akun.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'var(--h-size, 32px)' }}>Fitur Utama</h2>
          <div style={{ width: '48px', height: '4px', background: 'var(--p)', margin: '16px auto', borderRadius: '2px' }}></div>
        </div>

        <div className="grid-2">
          <div className="glass-card">
            <div className="text-p" style={{ marginBottom: '16px' }}><MapPin size={24}/></div>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>GPS Verifikasi</h3>
            <p className="text-muted" style={{ lineHeight: '1.6', margin: 0 }}>Memastikan kehadiran hanya dilakukan di area kantor.</p>
          </div>
          
          <div className="glass-card">
            <div className="text-p" style={{ marginBottom: '16px' }}><QrCode size={24}/></div>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>QR System</h3>
            <p className="text-muted" style={{ lineHeight: '1.6', margin: 0 }}>Scan cepat untuk meminimalisir kecurangan absensi.</p>
          </div>

          <div className="glass-card">
            <div className="text-p" style={{ marginBottom: '16px' }}><ShieldCheck size={24}/></div>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Data Aman</h3>
            <p className="text-muted" style={{ lineHeight: '1.6', margin: 0 }}>Data absensi disimpan aman di Database Cloudflare.</p>
          </div>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <a href="/privacy/" className="text-muted" style={{ textDecoration: 'none', fontWeight: 600 }}>Privacy</a>
            <a href="/terms/" className="text-muted" style={{ textDecoration: 'none', fontWeight: 600 }}>Terms</a>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.5 }}>
            © 2024 PRSNSI System.
          </p>
        </div>
      </div>
    </div>
  );
}
