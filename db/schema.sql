-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  picture TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  type TEXT, -- 'check_in' or 'check_out'
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  lat REAL,
  lng REAL,
  is_valid BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
