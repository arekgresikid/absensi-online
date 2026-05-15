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
  user,
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
    <div className="stack-v" style={{ gap: '40px' }}>
      
      {/* Hero Section */}
      <div className="glass-card" style={{ 
        padding: 'var(--hero-padding, 60px)', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(2, 6, 23, 0.8) 100%)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div className="hide-mobile" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, pointerEvents: 'none', transform: 'translate(20%, -20%)' }}>
          <Clock size={400} />
        </div>
        
        <div className="stack-v" style={{ position: 'relative', zIndex: 10, gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <p className="badge badge-p" style={{ marginBottom: '12px' }}>{today}</p>
              <h2 className="text-gradient" style={{ fontSize: 'var(--h-size, 48px)', lineHeight: 1.2, maxWidth: '100%' }}>
                Selamat Bekerja, <br/> {user.name.split(' ')[0]}
              </h2>
              <p className="text-muted" style={{ fontWeight: 600, marginTop: '8px' }}>Tetap semangat dan jaga kesehatan.</p>
            </div>
            <div style={{ flex: '0 0 auto', textAlign: 'left' }}>
              <p style={{ fontSize: 'var(--time-size, 64px)', fontWeight: 900, letterSpacing: '-2px', opacity: 0.9, margin: 0, lineHeight: 1 }}>{format(time, 'HH:mm:ss')}</p>
              <p className="text-p" style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 0 0' }}>Waktu Server</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="btn btn-outline" style={{ border: isWithinRange ? '1px solid var(--safe)' : '1px solid var(--danger)', cursor: 'default', padding: '8px 16px', fontSize: '13px' }}>
              <Signal size={16} color={isWithinRange ? 'var(--safe)' : 'var(--danger)'} />
              <span>{isWithinRange ? 'Radius Sesuai' : 'Luar Jangkauan'}</span>
            </div>
            <div className="btn btn-outline" style={{ cursor: 'default', padding: '8px 16px', fontSize: '13px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: attendanceStatus === 'not_started' ? 'var(--muted)' : 'var(--p)' }} />
              <span>{attendanceStatus === 'not_started' ? 'Belum Absen' : attendanceStatus === 'checked_in' ? 'Sudah Masuk' : 'Sudah Pulang'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={onCheckIn} disabled={attendanceStatus !== 'not_started' || !isWithinRange} className="btn btn-p" style={{ fontSize: '16px', padding: '14px 32px', flex: '1 1 auto' }}>
              Check In <ArrowRight size={18} />
            </button>
            {attendanceStatus === 'checked_in' && (
              <button onClick={onCheckOut} disabled={!isWithinRange} className="btn btn-outline" style={{ fontSize: '16px', padding: '14px 32px', flex: '1 1 auto' }}>
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid-2">
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '16px' }}>
              <CheckCircle2 className="text-p" size={24} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Hadir Minggu Ini</p>
              <h3 style={{ fontSize: '28px', margin: 0 }}>{logs.filter(l => {
                const logDate = new Date(l.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return logDate >= weekAgo;
              }).length} <span style={{ fontSize: '14px', fontWeight: 400 }}>Hari</span></h3>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '16px' }}>
              <History style={{ color: 'var(--safe)' }} size={24} />
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Total Jam Kerja</p>
              <h3 style={{ fontSize: '28px', margin: 0 }}>
                {Math.round(logs.reduce((acc, curr) => {
                  if (curr.check_in && curr.check_out) {
                    const [h1, m1] = curr.check_in.split(':').map(Number);
                    const [h2, m2] = curr.check_out.split(':').map(Number);
                    return acc + (h2 - h1) + (m2 - m1) / 60;
                  }
                  return acc;
                }, 0))} <span style={{ fontSize: '14px', fontWeight: 400 }}>Jam</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* History & Info */}
      <div className="grid-2">
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Riwayat Kehadiran</h3>
            <span className="badge badge-p" style={{ fontSize: '10px' }}>{logs.length} Total</span>
          </div>
          <div className="stack-v" style={{ padding: '24px', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {logs.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>Belum ada riwayat.</p>}
            {logs.map((log, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <p style={{ fontWeight: 800, margin: 0, fontSize: '14px' }}>{log.date}</p>
                  <p className="text-muted" style={{ fontSize: '11px', margin: 0 }}>{log.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 900, margin: 0, fontSize: '16px' }}>{log.check_in} - {log.check_out || '--:--'}</p>
                  <span className={`badge ${log.check_out ? 'badge-safe' : 'badge-p'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                    {log.check_out ? 'SELESAI' : 'AKTIF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MapPin size={20} className="text-p" />
            <h3 style={{ fontSize: '18px' }}>Informasi Kantor</h3>
          </div>
          <div className="stack-v" style={{ gap: '20px' }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: '16px', margin: 0 }}>Kantor Utama</p>
              <p className="text-muted" style={{ marginTop: '4px', fontSize: '13px' }}>Jalan Dr. Sutomo GG XIV, Gresik, Jawa Timur, Indonesia</p>
            </div>
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '180px' }}>
              <img src="/office_banner.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Office" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.6), transparent)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
