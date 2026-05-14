import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthProps {
  onSuccess: (response: any) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)',
      overflow: 'hidden' // Ensure no scroll
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 32px', marginBottom: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'var(--p)', padding: '16px', borderRadius: '20px', boxShadow: '0 10px 20px var(--p-glow)' }}>
            <ShieldCheck size={32} color="white" />
          </div>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>PRSNSI</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5' }}>
          Sistem absensi digital untuk efisiensi kerja Anda.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <GoogleLogin 
            onSuccess={onSuccess} 
            onError={() => console.log('Login Failed')}
            theme="filled_black"
            shape="pill"
            size="large"
          />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/privacy.html" style={{ color: 'var(--muted)', fontSize: '11px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms.html" style={{ color: 'var(--muted)', fontSize: '11px', textDecoration: 'none' }}>Terms of Service</a>
        </div>

        <p style={{ marginTop: '32px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, opacity: 0.6 }}>
          v2.0 • Digital Presence System
        </p>
      </motion.div>
    </div>
  );
}
