import { Clock, MapPin, CheckCircle2, History, ArrowRight, Signal } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from 'react';

interface DashboardProps {
  user: any;
  attendanceStatus: 'not_started' | 'checked_in' | 'checked_out';
  onCheckIn: () => void;
  onCheckOut: () => void;
  isWithinRange: boolean;
  logs: any[];
}

export default function Dashboard({ 
  attendanceStatus, 
  onCheckIn, 
  onCheckOut,
  isWithinRange,
  logs
}: DashboardProps) {
  const [time, setTime] = useState(new Date());
  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Hero Section */}
      <div className="card" style={{ padding: '60px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(23, 28, 38, 0.7) 100%)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.03, pointerEvents: 'none', transform: 'translate(20%, -20%)' }}>
          <Clock size={400} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <p style={{ color: 'var(--p)', fontWeight: 800, letterSpacing: '3px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>{today}</p>
              <h2 style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, maxWidth: '600px', marginBottom: '8px' }}>
                Selamat Bekerja
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 600 }}>Tetap semangat dan jaga kesehatan</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-3px', opacity: 0.9 }}>{format(time, 'HH:mm:ss')}</p>
              <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--p)', letterSpacing: '2px', textTransform: 'uppercase' }}>Waktu Server</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '16px 32px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px', border: isWithinRange ? '1px solid var(--success)' : '1px solid var(--danger)' }}>
              <Signal size={20} color={isWithinRange ? 'var(--success)' : 'var(--danger)'} />
              <span style={{ fontWeight: 800, fontSize: '14px' }}>{isWithinRange ? 'Radius Sesuai' : 'Luar Jangkauan'}</span>
            </div>
            <div className="card" style={{ padding: '16px 32px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: attendanceStatus === 'not_started' ? 'var(--muted)' : 'var(--p)' }} />
              <span style={{ fontWeight: 800, fontSize: '14px' }}>Status: {attendanceStatus === 'not_started' ? 'Belum Absen' : attendanceStatus === 'checked_in' ? 'Sudah Masuk' : 'Sudah Pulang'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button onClick={onCheckIn} disabled={attendanceStatus !== 'not_started' || !isWithinRange} className="btn btn-p" style={{ fontSize: '20px', padding: '20px 48px' }}>
              Check In Sekarang <ArrowRight size={24} />
            </button>
            {attendanceStatus === 'checked_in' && (
              <button onClick={onCheckOut} disabled={!isWithinRange} className="btn card" style={{ fontSize: '20px', padding: '20px 48px', marginBottom: 0 }}>
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <History size={24} color="var(--p)" />
            <h3 style={{ fontWeight: 900 }}>Riwayat Absensi Pribadi</h3>
          </div>
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {logs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontStyle: 'italic' }}>Belum ada riwayat hari ini.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <CheckCircle2 size={24} color="var(--success)" />
                    <div><p style={{ fontWeight: 800 }}>{log.date}</p><p className="badge badge-emp">Verified</p></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '24px', fontWeight: 900 }}>{log.checkIn}</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>OUT: {log.checkOut || '--:--'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MapPin size={24} color="var(--p)" />
            <h3 style={{ fontWeight: 900 }}>Informasi Kantor</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: '18px' }}>Gresik Office</p>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Jalan Dr. Sutomo GG XIV, Gresik, Jawa Timur</p>
            </div>
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '20px' }} alt="Office" />
          </div>
        </div>
      </div>
    </div>
  );
}
