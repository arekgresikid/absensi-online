import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, MapPin, QrCode, User as UserIcon, ShieldCheck, LogOut, Menu, FileText, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PresenceMap from './components/PresenceMap';
import QRScanner from './components/QRScanner';
import QRGenerator from './components/QRGenerator';
import LeaveRequest from './components/LeaveRequest';
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
  const [currentOffice, setCurrentOffice] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states for new location
  const [newLocName, setNewLocName] = useState('');
  const [newLocLat, setNewLocLat] = useState('');
  const [newLocLng, setNewLocLng] = useState('');

  // Global Location Tracking
  useEffect(() => {
    if (!user || offices.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let found = false;

        for (const office of offices) {
          const R = 6371e3;
          const φ1 = lat * Math.PI / 180, φ2 = office.latitude * Math.PI / 180;
          const Δφ = (office.latitude - lat) * Math.PI / 180, Δλ = (office.longitude - lng) * Math.PI / 180;
          const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
          const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          
          if (d <= GEOFENCE_RADIUS) {
            found = true;
            setCurrentOffice(office.name);
            break;
          }
        }
        setIsWithinRange(found);
        if (!found) setCurrentOffice(null);
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, offices]);

  const fetchData = async () => {
    try {
      const [usersRes, logsRes, leavesRes, locsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/attendance'),
        fetch('/api/leaves'),
        fetch('/api/locations')
      ]);
      const usersData = await usersRes.json();
      const logsData = await logsRes.json();
      const leavesData = await leavesRes.json();
      const locsData = await locsRes.json();
      setAllUsers(usersData);
      setLogs(logsData);
      setLeaves(leavesData);
      setOffices(locsData);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('prsnsi_user', JSON.stringify(user));
      fetchData();
      
      // Feature 4: Request Notification Permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      localStorage.removeItem('prsnsi_user');
    }
  }, [user]);

  // Feature 4: Auto-Reminder Check-out
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 17 && now.getMinutes() === 0) {
        const today = new Date().toDateString();
        const log = logs.find(l => l.date === today && l.user_email === user.email);
        if (log && !log.check_out && Notification.permission === 'granted') {
          new Notification("Jangan Lupa Check-out!", {
            body: "Sudah jam pulang, pastikan Anda melakukan check-out presensi.",
            icon: "/logo.png"
          });
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [user, logs]);

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Email', 'Nama', 'Tanggal', 'Masuk', 'Keluar', 'Lokasi'];
    const rows = logs.map(l => [l.id, l.user_email, l.user_name, l.date, l.check_in, l.check_out || '-', l.location]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan-Absensi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleDemoLogin = () => {
    const guestUser: UserProfile = {
      email: 'guest@demo.com',
      name: 'Tamu Demo (Publik)',
      picture: 'https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff',
      role: 'karyawan',
      joinedAt: new Date().toISOString()
    };
    setUser(guestUser);
    setLoginError(null);
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
        <Auth 
          onSuccess={handleLoginSuccess} 
          onDemoLogin={handleDemoLogin}
          error={loginError} 
        />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <h1 style={{ fontSize: '18px' }}>Absensi Online</h1>
        </div>

        <nav className="nav-group">
          <button onClick={() => changeTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={18}/> Dashboard</button>
          <button onClick={() => changeTab('map')} className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}><MapPin size={18}/> Lokasi Kantor</button>
          <button onClick={() => changeTab('scan')} className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}><QrCode size={18}/> Scan Absen</button>
          <button onClick={() => changeTab('leave')} className={`nav-item ${activeTab === 'leave' ? 'active' : ''}`}><FileText size={18}/> Pengajuan Izin</button>
          {user.role === 'admin' && (
            <button onClick={() => changeTab('admin')} className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}><ShieldCheck size={18}/> Admin Panel</button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {user.picture ? <img src={user.picture} /> : <UserIcon size={18} className="text-muted" />}
            <div className="user-details">
              <p style={{ fontSize: '14px', fontWeight: 800 }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', fontSize: '13px' }}><LogOut size={16}/> Keluar</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} className="btn btn-outline" style={{ padding: '8px' }}><Menu size={24}/></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="signal-dot" style={{ background: isWithinRange ? 'var(--safe)' : 'var(--danger)', width: '10px', height: '10px', borderRadius: '50%' }}></div>
            <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.5px' }}>{isWithinRange ? 'DI KANTOR' : 'LUAR KANTOR'}</span>
          </div>
          <div style={{ width: '40px' }}></div>
        </header>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
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
              {activeTab === 'map' && (
                <div className="glass-card">
                  <h2 style={{ marginBottom: '24px' }}>Radar Lokasi Kantor</h2>
                  <PresenceMap onLocationUpdate={() => {}} officeLocations={offices.map(o => ({ name: o.name, coords: [o.latitude, o.longitude] }))} geofenceRadius={GEOFENCE_RADIUS} />
                </div>
              )}
              {activeTab === 'scan' && (
                <div style={{ maxWidth: '500px', margin: '20px auto', width: '100%' }}>
                  <QRScanner onScan={async (text, photo) => {
                    if (text.includes('absensi') && isWithinRange) {
                      const today = new Date().toDateString();
                      const existing = logs.find(l => l.date === today && l.user_email === user.email);
                      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                      const logData = { 
                        id: existing ? existing.id : Math.random().toString(36).substr(2,9), 
                        user_email: user.email, 
                        user_name: user.name, 
                        date: today, 
                        check_in: existing ? existing.check_in : now, 
                        check_out: existing ? now : null, 
                        location: currentOffice || "Kantor",
                        photo: photo || null
                      };
                      await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) });
                      fetchData();
                      alert(existing ? `Check-out berhasil dari ${currentOffice}!` : `Check-in berhasil di ${currentOffice}!`);
                      setActiveTab('dashboard');
                    } else alert('Di luar radius kantor atau QR Code salah!');
                  }} />
                </div>
              )}
              {activeTab === 'leave' && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <LeaveRequest user={user} onSuccess={fetchData} />
                </div>
              )}
              {activeTab === 'admin' && user.role === 'admin' && (
                <div className="stack-v" style={{ gap: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <h2 style={{ fontSize: '32px' }}>Admin Panel</h2>
                    <button onClick={exportToCSV} className="btn btn-outline"><History size={18}/> Ekspor Laporan (CSV)</button>
                  </div>

                  <div className="grid-2">
                    <QRGenerator />
                    <div className="glass-card">
                      <h3 style={{ marginBottom: '24px' }}>Tambah Karyawan</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const newUser: any = { email: newUserEmail, name: newUserName, role: 'karyawan' };
                        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
                        setNewUserEmail(''); setNewUserName('');
                        fetchData();
                        alert("Berhasil!");
                      }} className="stack-v" style={{ gap: '16px' }}>
                        <input className="form-input" placeholder="Nama Lengkap" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                        <input className="form-input" type="email" placeholder="Email Google" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                        <button type="submit" className="btn btn-p" style={{ width: '100%' }}>Tambah Karyawan</button>
                      </form>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ marginBottom: '24px' }}>Persetujuan Izin / Cuti</h3>
                    <div className="stack-v" style={{ gap: '12px' }}>
                      {leaves.filter(l => l.status === 'pending').length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada pengajuan pending.</p>}
                      {leaves.filter(l => l.status === 'pending').map(l => (
                        <div key={l.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
                          <div>
                            <p style={{ fontWeight: 800, margin: 0 }}>{l.user_name} <span className="badge badge-p">{l.type}</span></p>
                            <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>{l.start_date} s/d {l.end_date} • "{l.reason}"</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={async () => { await fetch('/api/leaves', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: l.id, status: 'approved' }) }); fetchData(); }} className="btn btn-p" style={{ padding: '8px 16px', fontSize: '12px' }}>Setuju</button>
                            <button onClick={async () => { await fetch('/api/leaves', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: l.id, status: 'rejected' }) }); fetchData(); }} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '12px' }}>Tolak</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ marginBottom: '24px' }}>Daftar Karyawan</h3>
                    <div className="stack-v" style={{ gap: '0' }}>
                      {allUsers.map((u, i) => (
                        <div key={u.email} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '16px 0', 
                          borderBottom: i === allUsers.length - 1 ? 'none' : '1px solid var(--border)' 
                        }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>{u.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>{u.email}</p>
                          </div>
                          <select 
                            className="form-input" 
                            style={{ width: '120px', padding: '8px 12px' }}
                            value={u.role} 
                            onChange={async (e) => {
                              await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, role: e.target.value }) });
                              fetchData();
                            }}
                          >
                            <option value="karyawan">Karyawan</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature: Location Management */}
                  <div className="glass-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={20} color="var(--p)" /> Manajemen Lokasi Kantor
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <input className="form-input" placeholder="Nama Lokasi (Cabang)" value={newLocName} onChange={e => setNewLocName(e.target.value)} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input className="form-input" type="number" step="any" placeholder="Latitude" value={newLocLat} onChange={e => setNewLocLat(e.target.value)} />
                        <input className="form-input" type="number" step="any" placeholder="Longitude" value={newLocLng} onChange={e => setNewLocLng(e.target.value)} />
                      </div>
                      <button className="btn btn-p" onClick={async () => {
                        if (!newLocName || !newLocLat || !newLocLng) return alert('Lengkapi data!');
                        const id = Math.random().toString(36).substr(2,9);
                        await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name: newLocName, latitude: parseFloat(newLocLat), longitude: parseFloat(newLocLng) }) });
                        setNewLocName(''); setNewLocLat(''); setNewLocLng('');
                        fetchData();
                      }}>Tambah Lokasi</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {offices.map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                          <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>{o.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>{o.latitude}, {o.longitude}</p>
                          </div>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={async () => {
                            if (confirm('Hapus lokasi ini?')) {
                              await fetch('/api/locations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.id }) });
                              fetchData();
                            }
                          }}><Trash2 size={18} /></button>
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
