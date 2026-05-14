# PRSNSI - Modern Attendance System

Sistem Absensi Online berbasis web yang responsif, aman, dan ringan. Dirancang khusus untuk kebutuhan presensi internal dengan fitur verifikasi lokasi (Geofencing) dan pemindaian kode QR.

## 🚀 Fitur Utama

- **Geofencing Verification**: Presensi hanya dapat dilakukan jika pengguna berada dalam radius 50 meter dari koordinat kantor (Gresik, Gang XIV).
- **Dual QR Scanning**: 
  - Scan langsung menggunakan kamera perangkat.
  - Unggah gambar/screenshot QR Code secara manual.
- **Admin Panel (RBAC)**:
  - Manajemen User: Ubah jabatan karyawan (Admin, Staff, Karyawan).
  - Log Presensi Global: Pantau kehadiran seluruh staf secara real-time.
  - QR Generator: Hasilkan kode QR unik untuk absensi harian.
- **Auto-Admin Integration**: Pengenalan otomatis administrator utama melalui email yang terdaftar di environment variable.
- **High Performance UI**: Desain premium tanpa efek berat, memastikan kelancaran penggunaan di perangkat mobile lama sekalipun.
- **Privacy Protected**: Dilengkapi `robots.txt` agar tidak terindeks oleh mesin pencari publik.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite)
- **Styling**: Vanilla Semantic CSS (Optimized for performance)
- **Icons**: Lucide React
- **Maps**: React Leaflet (OpenStreetMap)
- **Scanner**: HTML5-QRCode
- **Auth**: Google OAuth 2.0

## 📦 Instalasi

1. Clone repositori ini:
   ```bash
   git clone [url-repo]
   cd absensi-online
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables (`.env`):
   ```env
   VITE_GOOGLE_CLIENT_ID=isi_dengan_client_id_google
   VITE_ADMIN_SECRET=Gresik2026
   VITE_ADMIN_EMAIL=email_admin_anda@gmail.com
   ```

4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## 🔐 Keamanan & Privasi

- Data presensi disimpan secara lokal di `localStorage` (untuk pengembangan).
- Untuk produksi, disarankan menggunakan database Cloudflare D1.
- Akses Admin dilindungi oleh *Secret Key* dengan fitur *show/hide* password.

## 📄 Lisensi

© 2024 PRSNSI System. Seluruh hak cipta dilindungi.
