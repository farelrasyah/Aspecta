# 🔧 Aspecta Troubleshooting Guide

## Error: "Failed to apply simulation"

### Kemungkinan Penyebab & Solusi:

#### 1. **Content Script Tidak Ter-inject**
**Gejala:** Extension tidak merespons saat tombol Apply diklik

**Solusi:**
- Buka Developer Tools (F12) → Console
- Cek apakah ada error "Aspecta: Content script initialized"
- Jika tidak ada, reload halaman web dan coba lagi
- Pastikan extension sudah ter-install dengan benar

#### 2. **Halaman Tidak Didukung**
**Gejala:** Error muncul di halaman internal browser

**Halaman yang TIDAK didukung:**
- `chrome://` (Chrome settings, extensions, dll)
- `chrome-extension://` (Extension pages)
- `edge://` (Edge internal pages)
- `about:` (Firefox internal pages)

**Solusi:**
- Buka website normal (contoh: google.com, github.com)
- Gunakan file test.html yang disediakan

#### 3. **Permission Tidak Memadai**
**Gejala:** Extension tidak bisa mengubah ukuran window

**Solusi:**
- Pastikan extension memiliki permission "tabs", "windows", "storage"
- Reload extension di chrome://extensions
- Aktifkan kembali extension jika perlu

#### 4. **Content Script Error**
**Gejala:** Error di console browser

**Debug steps:**
1. Buka Developer Tools (F12)
2. Klik Console tab
3. Cari error yang dimulai dengan "Aspecta:"
4. Screenshot error dan laporkan

### 📝 Testing Steps:

1. **Load extension:**
   ```
   1. Buka chrome://extensions
   2. Enable "Developer mode"
   3. Click "Load unpacked"
   4. Pilih folder Aspecta
   ```

2. **Test pada halaman normal:**
   ```
   1. Buka test.html atau website normal
   2. Klik icon Aspecta di toolbar
   3. Pilih device (misalnya iPhone SE)
   4. Klik Apply
   5. Amati perubahan viewport
   ```

3. **Debug dengan console:**
   ```
   1. Buka F12 → Console
   2. Cari log "Aspecta: Content script initialized"
   3. Cari log "Aspecta Popup: Current tab: [URL]"
   4. Cek apakah ada error merah
   ```

### 🐛 Common Issues:

#### Issue: "Extension context invalidated"
**Solusi:** Reload extension di chrome://extensions

#### Issue: "No active tab found"
**Solusi:** 
- Pastikan ada tab yang aktif
- Refresh popup dengan menutup dan membuka kembali

#### Issue: "Cannot access chrome:// URLs"
**Solusi:** Buka website normal, bukan halaman internal browser

#### Issue: Window tidak berubah ukuran
**Solusi:**
- Cek apakah browser dalam fullscreen mode
- Coba minimize dan restore window
- Pastikan tidak ada software lain yang mengontrol window size

### 📊 Debug Information:

Untuk melaporkan bug, sertakan informasi berikut:

```
Chrome Version: [Versi Chrome Anda]
Extension Version: 1.0.0
Operating System: Windows
URL yang ditest: [URL halaman]
Error message: [Copy paste error dari console]
Steps to reproduce: [Langkah-langkah yang menyebabkan error]
```

### 🚀 Manual Testing:

Jika extension tidak bekerja, coba manual testing:

1. **Test Viewport Meta:**
   - Buka Developer Tools → Elements
   - Cari `<meta name="viewport">`
   - Pastikan content berubah saat Apply diklik

2. **Test Window Resize:**
   - Buka console dan ketik: `window.resizeTo(375, 667)`
   - Jika tidak bekerja, browser mungkin memblokir resize

3. **Test Content Script:**
   - Console: `chrome.runtime.sendMessage({action: 'test'})`
   - Jika error, content script tidak loaded

### 💡 Tips Penggunaan:

1. **Gunakan pada website responsif** untuk hasil terbaik
2. **Disable zoom browser** (100% zoom) untuk akurasi
3. **Test di Incognito mode** jika ada konflik dengan extension lain
4. **Refresh halaman** jika layout tidak berubah
5. **Gunakan file test.html** untuk testing awal

### 🔄 Reinstall Steps:

Jika masalah berlanjut:

1. Hapus extension dari chrome://extensions
2. Restart browser
3. Install ulang extension
4. Test dengan file test.html
5. Jika masih error, laporkan dengan debug info lengkap
