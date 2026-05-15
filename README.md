# 🚀 Absensi Online - Modern Employee Management System

Sistem Absensi Online berbasis web yang responsif dan aman, dibangun menggunakan **React**, **Vite**, dan infrastruktur serverless **Cloudflare (Pages & D1 Database)**. Sistem ini dirancang untuk memudahkan manajemen kehadiran karyawan dengan fitur verifikasi lokasi (Geofencing) dan foto selfie.

---

## ✨ Fitur Unggulan

### 📊 Dashboard & Statistik
- **Ringkasan Mingguan**: Visualisasi jumlah hari kehadiran dalam seminggu terakhir.
- **Estimasi Jam Kerja**: Kalkulasi otomatis total jam kerja karyawan.
- **Log Riwayat**: Daftar riwayat kehadiran lengkap dengan status masuk/pulang.

### 📍 Multi-Lokasi & Geofencing (Radar)
- **Manajemen Lokasi Dinamis**: Admin dapat menambah/menghapus lokasi kantor cabang langsung dari Admin Panel.
- **Radius 100m**: Karyawan hanya bisa melakukan absensi jika berada di radius aman lokasi yang ditentukan.
- **Radar Lokasi**: Visualisasi peta interaktif menggunakan Leaflet untuk melihat sebaran kantor cabang.

### 📸 Verifikasi Keamanan
- **Selfie Verification**: Pengambilan foto otomatis menggunakan kamera depan saat melakukan scan QR Code.
- **QR Code System**: Verifikasi presensi menggunakan QR Code unik.

### 📝 Manajemen Izin & Cuti
- **Pengajuan Digital**: Karyawan dapat mengajukan izin (Sakit, Cuti, Izin) melalui aplikasi.
- **Persetujuan Admin**: Sistem approval satu pintu oleh Admin.

### 🛠️ Admin Panel & Ekspor Data
- **Manajemen User**: Pengaturan peran (Admin, Staff, Karyawan).
- **Ekspor CSV**: Download laporan kehadiran bulanan untuk kebutuhan administratif.
- **Notifikasi Browser**: Pengingat otomatis untuk check-out tepat waktu.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion (Animasi), Lucide Icons.
- **Peta**: React Leaflet & OpenStreetMap.
- **Backend**: Cloudflare Pages Functions (Serverless).
- **Database**: Cloudflare D1 (SQL-based Serverless Database).
- **Auth**: Google OAuth 2.0.
- **Styling**: Vanilla CSS (Custom Glassmorphism Design).

---

## 🚀 Panduan Instalasi Lokal

1. **Clone Repository**
   ```bash
   git clone https://github.com/arekgresikid/absensi-online.git
   cd absensi-online
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` di root directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_ADMIN_EMAIL=your_email@gmail.com
   ```

4. **Inisialisasi Database Lokal**
   ```bash
   npx wrangler d1 execute absensi-db --local --file=./db/schema.sql
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment ke Cloudflare

1. **Buat Database D1**
   ```bash
   npx wrangler d1 create absensi-db
   ```
   *Salin database_id ke file `wrangler.toml`.*

2. **Migrasi Database Remote**
   ```bash
   npx wrangler d1 execute absensi-db --remote --file=./db/schema.sql
   ```

3. **Deploy Aplikasi**
   ```bash
   npm run build
   npx wrangler pages deploy dist
   ```

---

## 🔑 Akun Demo

Untuk pengujian awal, Anda bisa memasukkan data user demo ke database:

```bash
npx wrangler d1 execute absensi-db --remote --command="INSERT OR IGNORE INTO users (email, name, picture, role) VALUES ('admin@demo.com', 'Demo Admin', 'https://ui-avatars.com/api/?name=Admin', 'admin');"
```

---

## 📄 Lisensi
Proyek ini dikembangkan untuk kebutuhan internal manajemen kehadiran.

---
*Developed with ❤️ by arekgresikid*
