import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, MapPin, QrCode, Key, Eye, User as UserIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PresenceMap from './components/PresenceMap';
import QRScanner from './components/QRScanner';
import QRGenerator from './components/QRGenerator';

// Konfigurasi Lokasi Kantor (Gang XIV Gresik)
const OFFICE_LOCATION: [number, number] = [-7.162430, 112.641947];
const GEOFENCE_RADIUS = 100; // 100 meter

interface UserProfile {
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'staff' | 'karyawan';
  joinedAt: string;
}

function App() {
  const [user, setUser] = useState<UserProfile | any>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Load Initial Data from API
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/attendance')
      ]);
      const usersData = await usersRes.json();
      const logsData = await logsRes.json();
      setAllUsers(usersData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleLoginSuccess = async (response: any) => {
    setLoginError(null);
    let decoded: any;
    
    if (response.isCustomFlow) {
      decoded = response.credential;
    } else {
      decoded = jwtDecode(response.credential);
    }

    const isSystemAdmin = decoded.email.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.toLowerCase();
    
    console.log("Login Attempt:", decoded.email, "Is Admin:", isSystemAdmin);

    try {
      const usersRes = await fetch('/api/users');
      if (!usersRes.ok) throw new Error("Database connection error");
      const existingUsers = await usersRes.json();
      const existingUser = existingUsers.find((u: any) => u.email.toLowerCase() === decoded.email.toLowerCase());

      if (!existingUser && !isSystemAdmin) {
        setLoginError("Akses Ditolak! Email (" + decoded.email + ") tidak terdaftar. Hubungi Admin.");
        return;
      }

      let userData: UserProfile;
      if (existingUser) {
        userData = { ...existingUser, picture: decoded.picture };
      } else {
        userData = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          role: 'admin', 
          joinedAt: new Date().toISOString()
        };
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        fetchData();
      }
      setUser(userData);
    } catch (err) {
      console.error("Login process error", err);
      setLoginError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
    }
  };

  const updateUserRole = async (email: string, newRole: 'admin' | 'staff' | 'karyawan') => {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: newRole })
    });
    fetchData();
    if (user.email === email) setUser({ ...user, role: newRole });
  };

  const handleClaimAdmin = () => {
    if (secretInput === import.meta.env.VITE_ADMIN_SECRET) {
      updateUserRole(user.email, 'admin');
      setShowAdminPrompt(false);
      setSecretInput('');
    } else {
      alert("Kode rahasia salah!");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;
    
    if (allUsers.find(u => u.email === newUserEmail)) {
      alert("Email sudah terdaftar!");
      return;
    }

    const newUser: any = {
      email: newUserEmail,
      name: newUserName,
      role: 'karyawan'
    };

    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    setNewUserEmail('');
    setNewUserName('');
    fetchData();
    alert("Karyawan berhasil didaftarkan!");
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    const R = 6371e3;
    const φ1 = lat * Math.PI / 180, φ2 = OFFICE_LOCATION[0] * Math.PI / 180;
    const Δφ = (OFFICE_LOCATION[0] - lat) * Math.PI / 180, Δλ = (OFFICE_LOCATION[1] - lng) * Math.PI / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setIsWithinRange(distance <= GEOFENCE_RADIUS);
  };

  const handleQRScan = async (text: string) => {
    if (text.includes('absensi') && isWithinRange) {
      const today = new Date().toDateString();
      const existing = logs.find(l => l.date === today && l.user_email === user.email);
      
      if (existing && existing.check_out) return alert('Sudah absen pulang hari ini!');
      
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const logData = {
        id: existing ? existing.id : Math.random().toString(36).substr(2,9),
        user_email: user.email,
        user_name: user.name,
        date: today,
        check_in: existing ? existing.check_in : now,
        check_out: existing ? now : null,
        location: "Kantor Gang XIV"
      };

      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });

      fetchData();
      alert(existing ? 'Check-out berhasil!' : 'Check-in berhasil!');
      setActiveTab('dashboard');
    } else alert('Di luar radius kantor atau QR Code salah!');
  };

  if (!user) return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Auth onSuccess={handleLoginSuccess} error={loginError} />
    </GoogleOAuthProvider>
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <img src="/logo.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <h1 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>Absensi Online</h1>
        </div>
        <nav style={{ flex: 1 }}>
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('map')} className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}><MapPin size={20}/> Lokasi</button>
          <button onClick={() => setActiveTab('scan')} className="btn btn-p" style={{ width: '100%', marginTop: '20px', padding: '12px', justifyContent: 'center' }}><QrCode size={20}/> Scan Absen</button>
        </nav>
        
        {user.role === 'admin' && (
          <button onClick={() => setActiveTab('admin')} className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} style={{ marginTop: 'auto', marginBottom: '16px' }}><ShieldCheck size={20}/> Admin Panel</button>
        )}

        <div className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', marginTop: user.role === 'admin' ? 0 : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.picture ? (
              <img src={user.picture} referrerPolicy="no-referrer" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={18}/></div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <span style={{ fontSize: '9px', color: 'var(--p)', fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Keluar</button>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {showAdminPrompt && (
            <div className="overlay">
              <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}><Key color="var(--p)" size={32}/> <h2 style={{ fontWeight: 900 }}>Unlock Admin</h2></div>
                <div className="input-group" style={{ position: 'relative' }}>
                  <input 
                    type={showSecret ? "text" : "password"} 
                    placeholder="Kode Rahasia..." 
                    value={secretInput} 
                    onChange={(e) => setSecretInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleClaimAdmin()} 
                    style={{ marginBottom: '24px' }} 
                  />
                  <button onClick={() => setShowSecret(!showSecret)} style={{ position: 'absolute', right: '16px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><Eye size={20} /></button>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}><button onClick={() => setShowAdminPrompt(false)} className="btn card" style={{ padding: '12px', flex: 1 }}>Batal</button><button onClick={handleClaimAdmin} className="btn btn-p" style={{ flex: 1 }}>Verifikasi</button></div>
              </div>
            </div>
          )}

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === 'dashboard' && (
              <Dashboard 
                user={user} 
                attendanceStatus={logs.find(l => l.date === new Date().toDateString() && l.user_email === user.email) ? (logs.find(l => l.date === new Date().toDateString() && l.user_email === user.email).check_out ? 'checked_out' : 'checked_in') : 'not_started'} 
                onCheckIn={() => setActiveTab('scan')} 
                onCheckOut={() => setActiveTab('scan')} 
                isWithinRange={isWithinRange} 
                logs={logs.filter(l => l.user_email === user.email)} 
              />
            )}
            {activeTab === 'map' && <div className="card"><h2 style={{ marginBottom: '24px', fontWeight: 900 }}>Verifikasi Lokasi Kantor</h2><PresenceMap onLocationUpdate={handleLocationUpdate} officeLocation={OFFICE_LOCATION} geofenceRadius={GEOFENCE_RADIUS} /></div>}
            {activeTab === 'scan' && <div style={{ maxWidth: '500px', margin: '0 auto' }}><QRScanner onScan={handleQRScan} /></div>}
            {activeTab === 'admin' && user.role === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="grid-2">
                  <QRGenerator />
                  <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                      <h3 style={{ fontWeight: 900, marginBottom: '16px' }}>Daftarkan Karyawan Baru</h3>
                      <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input className="card" style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)' }} placeholder="Nama Karyawan" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                        <input className="card" style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)' }} type="email" placeholder="Email Google Karyawan" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                        <button type="submit" className="btn btn-p" style={{ padding: '12px' }}>Tambah Karyawan</button>
                      </form>
                    </div>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontWeight: 900 }}>Manajemen User</h3></div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                      {allUsers.map(u => (
                        <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {u.picture ? <img src={u.picture} referrerPolicy="no-referrer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} /> : <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={16}/></div>}
                            <div><p style={{ fontSize: '14px', fontWeight: 700 }}>{u.name}</p><p style={{ fontSize: '10px', color: 'var(--muted)' }}>{u.email}</p></div>
                          </div>
                          <select value={u.role} onChange={(e) => updateUserRole(u.email, e.target.value as any)} style={{ fontSize: '10px', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', padding: '4px' }}><option value="karyawan">Karyawan</option><option value="staff">Staff</option><option value="admin">Admin</option></select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontWeight: 900 }}>Log Kehadiran Global</h3></div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                    {logs.map(log => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div><p style={{ fontWeight: 700 }}>{log.user_name}</p><p style={{ fontSize: '10px', color: 'var(--muted)' }}>{log.date}</p></div>
                        <div style={{ display: 'flex', gap: '12px' }}><span style={{ color: 'var(--p)', fontWeight: 800 }}>IN: {log.check_in}</span><span style={{ color: 'var(--muted)', fontWeight: 800 }}>OUT: {log.check_out || '--:--'}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
