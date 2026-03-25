# Panduan Database & Deployment (Tanpa Vercel Environment)

Ikuti langkah-langkah di bawah ini untuk mengatur database Anda dari awal dan men-deploy aplikasi secara otomatis, **tanpa perlu** menyentuh pengaturan Environment (Variabel) di dashboard Vercel.

## 1. Buat Project Supabase Baru
1. Kunjungi [Supabase](https://supabase.com/) dan buat project baru.
2. Tunggu beberapa menit hingga database selesai disiapkan.

## 2. Salin Kunci (API Keys)
Setelah project siap, buka menu **Project Settings -> API** di sidebar kiri. Anda akan membutuhkan 3 nilai berikut:
- **Project URL** (Gunakan untuk `NEXT_PUBLIC_SUPABASE_URL`)
- **anon / public key** (Gunakan untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **service_role / secret key** (Gunakan untuk `SUPABASE_SERVICE_ROLE_KEY`)

## 3. Siapkan Database Tables
1. Buka menu **SQL Editor** di sidebar kiri Supabase.
2. Buka file `database/schema.sql` di repository lokal komputer Anda, salin semua isinya, lalu tempel (paste) dan klik **Run** di SQL Editor. Ini akan menginisiasi tabel dasar untuk *user* dan *redemptions*.
3. Buka file `database/01_admin_features.sql`, salin isinya, lalu klik **Run** lagi. Langkah ini **wajib** agar halaman Dasbor Admin (`/admin`) bisa berfungsi sepenuhnya (mendukung tabel API Key AI dan integrasi status Admin User).

## 4. Masukkan Kunci ke dalam Kode
Buka file bernama `.env.production` di folder utama project ini di komputer Anda. Anda akan melihat struktur seperti ini:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh...your-anon-key...xxxx"
SUPABASE_SERVICE_ROLE_KEY="eyJh...your-service-role-key...xxxx"
CRON_SECRET="super_secret_cron_key_123"
```
Ganti tulisan di atas dengan nilai asli yang Anda dapatkan dari Supabase (Langkah 2).
*Catatan Keamanan: Pastikan Anda menjaga privasi repository GitHub Anda (atur ke mode Private), karena kunci `SUPABASE_SERVICE_ROLE_KEY` sangat rahasia bila masuk di riwayat Git.*

## 5. Simpan & Push ke GitHub!
Sekarang Anda hanya perlu mengirim pembaruan kode yang telah terisi *key* Supabase ini ke GitHub:
```bash
git add .
git commit -m "chore: setup supabase secrets in .env.production"
git push
```
Vercel akan secara otomatis melakukan sinkronisasi *deployment* terbaru menggunakan konfigurasi dari `.env.production`. Aplikasi Anda pun langsung siap digunakan! 🚀
