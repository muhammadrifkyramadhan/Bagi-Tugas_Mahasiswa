# SIM-TUGAS: Sistem Informasi Pembagian & Monitoring Tugas Kelompok Mahasiswa Berbasis Web

> Solusi terintegrasi untuk menyelesaikan kendala koordinasi tugas kelompok kuliah di WhatsApp, transparansi alokasi beban kerja anggota, pencegahan lupa deadline, pengawasan ketua, serta asesmen kontribusi individu oleh dosen pengampu.

---

## 📌 1. Latar Belakang & Masalah yang Diteliti

1. **Koordinasi Tercecer di WhatsApp**: Pembagian tugas via chat WA mudah tertimbun dan tidak memiliki pelacakan status yang jelas.
2. **Ketidakjelasan Tanggung Jawab Anggota**: Anggota tim tidak mengetahui dengan pasti rincian tugas masing-masing serta tidak dapat melihat perkembangan tugas rekan satu timnya.
3. **Mahasiswa Lupa Deadline**: Ketiadaan pengingat otomatis menyebabkan keterlambatan pengumpulan tugas modul.
4. **Ketua Kelompok Kesulitan Memantau Progres**: Ketua kesulitan melacak revisi berkas pengerjaan dan memvalidasi pekerjaan anggota sebelum diserahkan.
5. **Dosen Sulit Menilai Kontribusi Nyata Setiap Individu**: Dosen pengampu hanya menerima laporan akhir tanpa tahu siapa yang benar-benar bekerja dan siapa yang *free rider*.

---

## 👥 2. Peran Pengguna (Role-Based Access Control)

### 👑 1. Ketua Kelompok
- Membuat kelompok baru dan menerbitkan kode undangan (*invite code*).
- Menambahkan anggota kelompok beserta pembagian fokus/spesialisasi kerja.
- Membuat tugas baru, menentukan bobot tugas (%), tenggat waktu (deadline), dan checklist subtask.
- Mengalokasikan penanggung jawab (*Person in Charge / PIC*) tugas.
- Menginspeksi berkas pengerjaan yang diajukan anggota.
- Memberikan catatan revisi detail jika hasil tugas belum sesuai standar.
- Memberikan persetujuan (*Approved / Selesai*).

### 👤 2. Anggota Tim
- Melihat daftar tugas yang dialokasikan kepadanya dan tugas anggota lain.
- Memperbarui status pengerjaan (*Belum Dimulai* → *Sedang Dikerjakan* → *Menunggu Review*).
- Mengunggah tautan/berkas hasil pengerjaan (Figma, GitHub PR, Google Drive, dokumen laporan).
- Menulis catatan perkembangan dan berdiskusi pada thread komentar tugas.
- Memantau hitung mundur tenggat waktu dan menyinkronkan ke Google Calendar.
- Menyelesaikan poin-poin revisi yang diminta oleh ketua.

### 🎓 3. Dosen Pengampu
- Mengaudit semua kelompok mahasiswa dalam kelas perkuliahan.
- Memantau matriks kontribusi riil setiap mahasiswa (*Workload Fairness*).
- Menginspeksi pembagian tugas, link berkas pengerjaan, dan catatan revisi.
- Memberikan nilai per modul tugas (*0 - 100*) dan feedback teknis.
- Mengisi rubrik evaluasi kelompok berdasarkan 4 kriteria:
  1. Kerja Sama & Kolaborasi Tim (1 - 5)
  2. Ketepatan Waktu Deadline (1 - 5)
  3. Kualitas Teknis Modul (1 - 5)
  4. Dokumentasi & Spesifikasi SRS (1 - 5)
- Menerbitkan nilai akhir kelompok beserta ulasan resmi dosen.

---

## 💻 3. Panduan Menjalankan di Visual Studio Code

### Prasyarat:
Pastikan komputer Anda telah terinstal **Node.js** (versi 18 ke atas) dan **npm**.

### Langkah-langkah:
1. **Ekstrak File ZIP**:
   Ekstrak file `sim-tugas-project.zip` ke folder komputer Anda (misal `D:\sim-tugas`).
2. **Buka di VS Code**:
   Buka VS Code → **File** → **Open Folder...** → pilih folder `sim-tugas`.
3. **Install Dependensi**:
   Buka terminal di VS Code (<kbd>Ctrl</kbd> + <kbd>`</kbd>), lalu jalankan:
   ```bash
   npm install
