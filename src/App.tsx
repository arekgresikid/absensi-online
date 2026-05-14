import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, MapPin, QrCode, User as UserIcon, ShieldCheck, LogOut, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PresenceMap from './components/PresenceMap';
import QRScanner from './components/QRScanner';
import QRGenerator from './components/QRGenerator';

const OFFICE_LOCATION: [number, number] = [-7.162430, 112.641947];
const GEOFENCE_RADIUS = 100;

interface UserProfile {
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'staff' | 'karyawan';
  joinedAt: string;
}

function App() {
  const [user, setUser] = useState<UserProfile | any>(() => {
    const saved = localStorage.getItem('prsnsi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Location Tracking
  useEffect(() => {
    if (!user) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const R = 6371e3;
        const φ1 = lat * Math.PI / 180, φ2 = OFFICE_LOCATION[0] * Math.PI / 180;
        const Δφ = (OFFICE_LOCATION[0] - lat) * Math.PI / 180, Δλ = (OFFICE_LOCATION[1] - lng) * Math.PI / 180;
        const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        setIsWithinRange(d <= GEOFENCE_RADIUS);
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
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
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('prsnsi_user', JSON.stringify(user));
      fetchData();
    } else {
      localStorage.removeItem('prsnsi_user');
    }
  }, [user]);

  const handleLoginSuccess = async (response: any) => {
    setLoginError(null);
    let decoded: any = response.isCustomFlow ? response.credential : jwtDecode(response.credential);
    const isSystemAdmin = decoded.email.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.toLowerCase();

    try {
      const usersRes = await fetch('/api/users');
      if (!usersRes.ok) {
        setLoginError("Koneksi API Gagal (404/500). Pastikan dijalankan di Cloudflare atau Wrangler.");
        return;
      }
      const existingUsers = await usersRes.json();
      const existingUser = existingUsers.find((u: any) => u.email.toLowerCase() === decoded.email.toLowerCase());

      if (!existingUser && !isSystemAdmin) {
        setLoginError(`Akses Ditolak! Email (${decoded.email}) belum terdaftar.`);
        return;
      }

      let userData: UserProfile = existingUser ? { ...existingUser, picture: decoded.picture } : {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        role: 'admin', 
        joinedAt: new Date().toISOString()
      };

      if (!existingUser) {
        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
      }
      setUser(userData);
      fetchData();
    } catch (err) {
      setLoginError("Database Error.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('prsnsi_user');
    window.location.reload();
  };

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  if (!user) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return <div style={{ padding: '40px', color: 'red' }}>VITE_GOOGLE_CLIENT_ID Error</div>;
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <Auth onSuccess={handleLoginSuccess} error={loginError} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <h1 style={{ fontSize: '18px', fontWeight: 900 }}>Absensi Online</h1>
          </div>
        </div>

        <nav className="nav-group">
          <button onClick={() => changeTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={18}/> Dashboard</button>
          <button onClick={() => changeTab('map')} className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}><MapPin size={18}/> Lokasi Kantor</button>
          <button onClick={() => changeTab('scan')} className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}><QrCode size={18}/> Scan Absen</button>
          {user.role === 'admin' && (
            <button onClick={() => changeTab('admin')} className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}><ShieldCheck size={18}/> Admin Panel</button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {user.picture ? <img src={user.picture} style={{ width: '32px', height: '32px', borderRadius: '50%' }} /> : <UserIcon size={18}/>}
            <div style={{ overflow: 'hidden' }}><p style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</p></div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ color: '#ef4444', padding: '10px 12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}><LogOut size={16}/> Keluar</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Menu size={24}/></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="signal-dot" style={{ background: isWithinRange ? 'var(--safe)' : 'var(--danger)' }}></div>
            <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>{isWithinRange ? 'DI KANTOR' : 'LUAR KANTOR'}</span>
          </div>
          <div style={{ width: '24px' }}></div>
        </header>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  attendanceStatus={logs.find(l => l.date === new Date().toDateString() && l.user_email === user.email) ? (logs.find(l => l.date === new Date().toDateString() && l.user_email === user.email).check_out ? 'checked_out' : 'checked_in') : 'not_started'} 
                  onCheckIn={() => setActiveTab('scan')} onCheckOut={() => setActiveTab('scan')} 
                  isWithinRange={isWithinRange} logs={logs.filter(l => l.user_email === user.email)} 
                />
              )}
              {activeTab === 'map' && (
                <div className="card">
                  <h2 style={{ marginBottom: '24px', fontWeight: 900 }}>Radar Lokasi</h2>
                  <PresenceMap onLocationUpdate={() => {}} officeLocation={OFFICE_LOCATION} geofenceRadius={GEOFENCE_RADIUS} />
                </div>
              )}
              {activeTab === 'scan' && <div style={{ maxWidth: '500px', margin: '0 auto' }}><QRScanner onScan={async (text) => {
                if (text.includes('absensi') && isWithinRange) {
                  const today = new Date().toDateString();
                  const existing = logs.find(l => l.date === today && l.user_email === user.email);
                  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const logData = { id: existing ? existing.id : Math.random().toString(36).substr(2,9), user_email: user.email, user_name: user.name, date: today, check_in: existing ? existing.check_in : now, check_out: existing ? now : null, location: "Kantor" };
                  await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) });
                  fetchData();
                  alert(existing ? 'Check-out berhasil!' : 'Check-in berhasil!');
                  setActiveTab('dashboard');
                } else alert('Di luar radius kantor atau QR Code salah!');
              }} /></div>}
              {activeTab === 'admin' && user.role === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div className="grid-2">
                    <QRGenerator />
                    <div className="card">
                      <h3 style={{ fontWeight: 900, marginBottom: '20px' }}>Tambah Karyawan</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const newUser: any = { email: newUserEmail, name: newUserName, role: 'karyawan' };
                        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
                        setNewUserEmail(''); setNewUserName('');
                        fetchData();
                        alert("Berhasil!");
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input placeholder="Nama Lengkap" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                        <input type="email" placeholder="Email Google" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                        <button type="submit" className="btn btn-p" style={{ justifyContent: 'center' }}>Tambah</button>
                      </form>
                    </div>
                  </div>
                  <div className="card">
                    <h3 style={{ fontWeight: 900, marginBottom: '20px' }}>Daftar Karyawan</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {allUsers.map(u => (
                        <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                          <div><p style={{ fontWeight: 700, fontSize: '14px' }}>{u.name}</p><p style={{ fontSize: '11px', opacity: 0.6 }}>{u.email}</p></div>
                          <select value={u.role} onChange={async (e) => {
                            await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, role: e.target.value }) });
                            fetchData();
                          }} style={{ width: '100px', padding: '4px' }}><option value="karyawan">Karyawan</option><option value="staff">Staff</option><option value="admin">Admin</option></select>
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
    </div>
  );
}

export default App;
