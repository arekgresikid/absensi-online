import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PresenceMap from './components/PresenceMap';
import QRScanner from './components/QRScanner';
import QRGenerator from './components/QRGenerator';
import { LogOut, LayoutDashboard, Map as MapIcon, QrCode, ShieldCheck, User as UserIcon, List, Search, Download, UserCheck, Key, Users as UsersIcon, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OFFICE_LOCATION: [number, number] = [-7.162430, 112.641947]; 
const GEOFENCE_RADIUS = 100;

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'staff' | 'karyawan';
  joinedAt: string;
}

function App() {
  const [user, setUser] = useState<UserProfile | any>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedLogs = localStorage.getItem('attendance_logs');
    const savedAllUsers = localStorage.getItem('registered_users');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedAllUsers) setAllUsers(JSON.parse(savedAllUsers));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('attendance_logs', JSON.stringify(logs));
    localStorage.setItem('registered_users', JSON.stringify(allUsers));
  }, [user, logs, allUsers]);

  const handleLoginSuccess = (response: any) => {
    const decoded: any = jwtDecode(response.credential);
    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const existingUser = existingUsers.find((u: UserProfile) => u.email === decoded.email);

    let userData: UserProfile;
    if (existingUser) {
      userData = { ...existingUser, picture: decoded.picture };
    } else {
      // Check if this email is the one specified in .env as primary admin
      const isSystemAdmin = decoded.email === import.meta.env.VITE_ADMIN_EMAIL;
      
      userData = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        role: isSystemAdmin ? 'admin' : 'karyawan', 
        joinedAt: new Date().toISOString()
      };
      setAllUsers([...existingUsers, userData]);
    }
    setUser(userData);
  };

  const updateUserRole = (email: string, newRole: 'admin' | 'staff' | 'karyawan') => {
    const updatedUsers = allUsers.map(u => u.email === email ? { ...u, role: newRole } : u);
    setAllUsers(updatedUsers);
    if (user.email === email) setUser({ ...user, role: newRole });
  };

  const handleClaimAdmin = () => {
    if (secretInput === import.meta.env.VITE_ADMIN_SECRET) {
      updateUserRole(user.email, 'admin');
      setShowAdminPrompt(false);
    } else alert('Salah!');
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    const R = 6371e3;
    const φ1 = lat * Math.PI / 180, φ2 = OFFICE_LOCATION[0] * Math.PI / 180;
    const Δφ = (OFFICE_LOCATION[0] - lat) * Math.PI / 180, Δλ = (OFFICE_LOCATION[1] - lng) * Math.PI / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setIsWithinRange(distance <= GEOFENCE_RADIUS);
  };

  const handleQRScan = (text: string) => {
    if (text.includes('absensi') && isWithinRange) {
      const today = new Date().toDateString();
      if (logs.find(l => l.date === today && l.userEmail === user.email && l.checkOut)) return alert('Sudah!');
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const existing = logs.find(l => l.date === today && l.userEmail === user.email);
      
      if (!existing) {
        setLogs([{ id: Math.random().toString(36).substr(2,9), userEmail: user.email, userName: user.name, date: today, checkIn: now, checkOut: null }, ...logs]);
        alert('Check-in!');
      } else {
        setLogs(logs.map(l => l.id === existing.id ? { ...l, checkOut: now } : l));
        alert('Check-out!');
      }
      setActiveTab('dashboard');
    } else alert('Luar radius / QR Salah!');
  };

  if (!user) return <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}><Auth onSuccess={handleLoginSuccess} /></GoogleOAuthProvider>;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ background: 'var(--p)', padding: '10px', borderRadius: '12px' }}><ShieldCheck color="white" /></div>
          <h2 style={{ fontWeight: 900, letterSpacing: '-1px' }}>PRSNSI</h2>
        </div>
        <nav style={{ flex: 1 }}>
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('map')} className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}><MapIcon size={20}/> Lokasi</button>
          <button onClick={() => setActiveTab('scan')} className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}><QrCode size={20}/> Scan QR</button>
          {user.role === 'admin' && <button onClick={() => setActiveTab('admin')} className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}><ShieldCheck size={20}/> Admin Panel</button>}
        </nav>
        <button onClick={() => { setUser(null); localStorage.removeItem('user'); }} className="nav-item" style={{ color: 'var(--danger)' }}><LogOut size={20}/> Keluar</button>
      </aside>

      <main className="main-content">
        <div className="header">
          <div><h1 style={{ fontSize: '32px', fontWeight: 900 }}>Halo, {user.name.split(' ')[0]}!</h1><p style={{ color: 'var(--muted)' }}>Gresik Digital Presence System.</p></div>
          <div className="profile-chip">
            {user.picture ? (
              <img 
                src={user.picture} 
                className="profile-img" 
                referrerPolicy="no-referrer"
                onClick={() => user.role !== 'admin' && setShowAdminPrompt(true)}
                alt="Profile"
              />
            ) : (
              <div 
                className="profile-img" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p)', color: 'white' }}
                onClick={() => user.role !== 'admin' && setShowAdminPrompt(true)}
              >
                <UserIcon size={24} />
              </div>
            )}
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800 }}>{user.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.role === 'admin' ? 'var(--p)' : 'var(--success)' }} />
                <span className={`badge badge-${user.role === 'admin' ? 'admin' : user.role === 'staff' ? 'staff' : 'emp'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

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
                  <button 
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ position: 'absolute', right: '16px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                  >
                    {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}><button onClick={() => setShowAdminPrompt(false)} className="btn card" style={{ padding: '12px', flex: 1 }}>Batal</button><button onClick={handleClaimAdmin} className="btn btn-p" style={{ flex: 1 }}>Verifikasi</button></div>
              </div>
            </div>
          )}

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === 'dashboard' && <Dashboard user={user} attendanceStatus={logs.find(l => l.date === new Date().toDateString() && l.userEmail === user.email) ? (logs.find(l => l.date === new Date().toDateString() && l.userEmail === user.email).checkOut ? 'checked_out' : 'checked_in') : 'not_started'} onCheckIn={() => setActiveTab('scan')} onCheckOut={() => setActiveTab('scan')} isWithinRange={isWithinRange} logs={logs.filter(l => l.userEmail === user.email)} />}
            {activeTab === 'map' && <div className="card"><h2 style={{ marginBottom: '24px', fontWeight: 900 }}>Verifikasi Lokasi Kantor</h2><PresenceMap onLocationUpdate={handleLocationUpdate} officeLocation={OFFICE_LOCATION} geofenceRadius={GEOFENCE_RADIUS} /></div>}
            {activeTab === 'scan' && <div style={{ maxWidth: '500px', margin: '0 auto' }}><QRScanner onScan={handleQRScan} /></div>}
            {activeTab === 'admin' && user.role === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="grid-2">
                  <QRGenerator />
                  <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}><h3 style={{ fontWeight: 900 }}>Manajemen User</h3></div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                      {allUsers.map(u => (
                        <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {u.picture ? (
                              <img src={u.picture} referrerPolicy="no-referrer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={16}/></div>
                            )}
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
                        <div><p style={{ fontWeight: 700 }}>{log.userName}</p><p style={{ fontSize: '10px', color: 'var(--muted)' }}>{log.date}</p></div>
                        <div style={{ display: 'flex', gap: '12px' }}><span style={{ color: 'var(--p)', fontWeight: 800 }}>IN: {log.checkIn}</span><span style={{ color: 'var(--muted)', fontWeight: 800 }}>OUT: {log.checkOut || '--:--'}</span></div>
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
