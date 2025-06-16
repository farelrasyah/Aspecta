# 📱 Aspecta - Mobile Simulator Chrome Extension

**Aspecta** adalah Chrome Extension untuk menguji tampilan website di berbagai ukuran perangkat mobile secara cepat dan mudah, langsung dari popup extension tanpa perlu membuka DevTools.

## ✨ Fitur Utama

### 🎯 Simulasi Viewport
- **Preset Perangkat Populer**: iPhone SE, iPhone 14 Pro, Galaxy S22, Pixel 7, iPad, dll.
- **Custom Dimensions**: Input manual width x height sesuai kebutuhan
- **Rotation Toggle**: Beralih antara mode Portrait dan Landscape
- **Real-time Resize**: Ubah dimensi window aktual tanpa reload halaman

### 🔧 Fitur Tambahan
- **Mobile User Agent**: Emulasi user-agent header untuk tampilan mobile asli
- **Screenshot**: Ambil screenshot langsung dari popup
- **Custom Presets**: Simpan dan kelola preset ukuran custom
- **Visual Indicator**: Indikator simulasi yang bisa dihilangkan
- **Auto-cleanup**: Membersihkan rules yang tidak terpakai secara otomatis

### 💾 Penyimpanan Lokal
- Simpan custom presets menggunakan `chrome.storage.local`
- Presets tersimpan permanen hingga dihapus manual

## 🚀 Instalasi

### Cara 1: Install dari File
1. Download atau clone repository ini
2. Buka Chrome dan navigasi ke `chrome://extensions/`
3. Aktifkan "Developer mode" di pojok kanan atas
4. Klik "Load unpacked" dan pilih folder `Aspecta`
5. Extension siap digunakan!

### Cara 2: Install dari ZIP
1. Download repository sebagai ZIP
2. Extract ke folder pilihan Anda
3. Ikuti langkah 2-5 dari cara 1

## 📖 Cara Penggunaan

### Simulasi Cepat
1. Klik ikon Aspecta di toolbar Chrome
2. Pilih perangkat dari dropdown "Device Preset"
3. Klik "Apply Simulation"
4. Website akan menyesuaikan ukuran sesuai perangkat yang dipilih

### Custom Dimensions
1. Buka popup Aspecta
2. Masukkan width dan height manual di bagian "Custom Dimensions"
3. Toggle "Landscape Mode" jika diperlukan
4. Klik "Apply Simulation"

### Mengelola Preset
1. Atur dimensi yang diinginkan (preset atau custom)
2. Klik "Save Current" untuk menyimpan sebagai preset
3. Preset akan muncul di bagian "Custom Presets"
4. Klik preset untuk menggunakan, atau "×" untuk menghapus

### Screenshot
1. Setelah apply simulasi
2. Klik tombol "Take Screenshot"
3. File screenshot akan otomatis terdownload

### Reset Simulasi
1. Klik tombol "Reset" untuk mengembalikan tampilan normal
2. Semua perubahan viewport dan user agent akan direset

## 🏗️ Arsitektur

```
Aspecta/
├── manifest.json          # Chrome Extension Manifest V3
├── popup.html             # Interface popup utama
├── popup.js               # Logika UI dan kontrol simulasi
├── styles.css             # Styling untuk popup
├── content.js             # Content script untuk manipulasi viewport
├── background.js          # Service worker untuk user agent & tab management
├── devices.json           # Database preset perangkat
├── icons/                 # Ikon extension
│   ├── icon.svg          # Vector icon source
│   ├── icon-16.png       # Icon 16x16
│   ├── icon-32.png       # Icon 32x32
│   ├── icon-48.png       # Icon 48x48
│   └── icon-128.png      # Icon 128x128
└── README.md             # Dokumentasi ini
```

## 🔧 Fitur Teknis

### Permissions yang Digunakan
- `activeTab`: Akses tab aktif untuk screenshot dan manipulasi
- `tabs`: Mengelola informasi tab
- `windows`: Mengubah ukuran window browser
- `storage`: Menyimpan custom presets
- `webNavigation`: Monitoring navigasi halaman

### API Chrome yang Digunakan
- `chrome.tabs`: Tab management dan screenshot
- `chrome.windows`: Window resizing
- `chrome.storage.local`: Penyimpanan preset
- `chrome.declarativeNetRequest`: User agent manipulation
- `chrome.runtime`: Message passing antar komponen

### Teknologi
- **Manifest V3**: Format extension Chrome terbaru
- **Service Worker**: Background processing
- **Content Scripts**: DOM manipulation
- **Modern CSS**: Gradients, flexbox, animations
- **Vanilla JavaScript**: Tanpa dependency eksternal

## 🎨 UI/UX Features

- **Modern Design**: Gradient background dengan border radius
- **Responsive Layout**: Layout yang menyesuaikan konten
- **Smooth Animations**: Transisi halus untuk toggle dan button
- **Visual Feedback**: Status indicator dan loading states
- **Mobile-friendly**: Interface yang mudah digunakan
- **Color-coded Status**: Warna berbeda untuk status yang berbeda

## ⚠️ Catatan Penting

### Limitasi
- Extension bekerja pada tab aktif saja
- Beberapa website mungkin menggunakan teknik responsive yang kompleks
- User agent override mungkin tidak bekerja di semua situs
- Window resizing dibatasi oleh sistem operasi

### Browser Support
- Chrome 100+ (untuk Manifest V3)
- Chromium-based browsers dengan dukungan extension

### Troubleshooting
- Jika simulasi tidak bekerja, coba refresh halaman
- Untuk website kompleks, mungkin perlu beberapa kali apply
- Pastikan website tidak menggunakan iframe yang kompleks

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Ide Pengembangan
- [ ] Multi-device preview grid
- [ ] Export/import preset collections
- [ ] Integration dengan design tools
- [ ] Performance monitoring
- [ ] Advanced screenshot options

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Farel Rasyah**
- Extension ini dibuat untuk memudahkan development dan testing responsive design

## 🙏 Acknowledgments

- Chrome Extension Documentation
- Modern web development best practices
- Community feedback dan suggestions

---

**Happy Testing! 🚀**
