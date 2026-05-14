-- Tabel untuk menyimpan daftar karyawan yang diizinkan (Whitelist)
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    picture TEXT,
    role TEXT DEFAULT 'karyawan',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan log kehadiran
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    date TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT,
    location TEXT,
    photo TEXT, -- Base64 atau URL foto selfie
    FOREIGN KEY (user_email) REFERENCES users(email)
);

-- Tabel untuk pengajuan izin/cuti
CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    type TEXT NOT NULL, -- Sakit, Izin, Cuti
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email)
);
