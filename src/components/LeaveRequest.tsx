import { useState } from 'react';
import { Calendar, FileText, Send, Clock } from 'lucide-react';

interface LeaveRequestProps {
  user: any;
  onSuccess: () => void;
}

export default function LeaveRequest({ user, onSuccess }: LeaveRequestProps) {
  const [type, setType] = useState('Izin');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requestData = {
      id: Math.random().toString(36).substr(2, 9),
      user_email: user.email,
      user_name: user.name,
      type,
      start_date: startDate,
      end_date: endDate,
      reason
    };

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (res.ok) {
        alert('Pengajuan berhasil dikirim!');
        setStartDate('');
        setEndDate('');
        setReason('');
        onSuccess();
      }
    } catch (err) {
      alert('Gagal mengirim pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card stack-v" style={{ gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '16px' }}>
          <FileText className="text-p" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '24px' }}>Pengajuan Izin / Cuti</h2>
          <p className="text-muted">Isi formulir di bawah untuk mengajukan ketidakhadiran.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack-v" style={{ gap: '20px' }}>
        <div className="grid-2">
          <div className="stack-v" style={{ gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>Jenis Izin</label>
            <select 
              className="form-input" 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Cuti">Cuti</option>
            </select>
          </div>
          <div className="stack-v" style={{ gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>Alasan Singkat</label>
            <input 
              className="form-input" 
              placeholder="Contoh: Keperluan Keluarga" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="stack-v" style={{ gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>Tanggal Mulai</label>
            <input 
              type="date" 
              className="form-input" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required 
            />
          </div>
          <div className="stack-v" style={{ gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>Tanggal Selesai</label>
            <input 
              type="date" 
              className="form-input" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required 
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-p" style={{ padding: '16px', fontSize: '16px' }}>
          {loading ? 'Mengirim...' : <><Send size={18} /> Kirim Pengajuan</>}
        </button>
      </form>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Clock size={16} className="text-p" />
          <h4 style={{ fontSize: '14px' }}>Ketentuan Pengajuan</h4>
        </div>
        <ul className="text-muted" style={{ fontSize: '12px', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
          <li>Pengajuan sakit harus menyertakan bukti surat dokter (bisa dikirim via WhatsApp ke Admin).</li>
          <li>Pengajuan cuti minimal dilakukan 3 hari sebelum tanggal mulai.</li>
          <li>Status pengajuan dapat dilihat di halaman Dashboard setelah disetujui Admin.</li>
        </ul>
      </div>
    </div>
  );
}
