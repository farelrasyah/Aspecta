# 📱 Aspecta - Mobile Device Simulator

> **Chrome Extension dengan Visual Device Simulator untuk responsive testing yang realistis**

![Aspecta Preview](https://img.shields.io/badge/Chrome-Extension-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Fitur Terbaru: Visual Device Simulator

### 🎯 **Device Frame Preview**
- **Frame perangkat realistis** dengan style iPhone, Android, dan Tablet
- **Live website preview** dalam frame perangkat yang dipilih
- **Real-time rendering** website dalam simulasi visual
- **Responsive preview** langsung di popup extension

### 📱 **Cara Kerja Simulator Visual**

1. **Pilih Device** → Extension menampilkan frame perangkat
2. **Apply Simulation** → Website dimuat dalam frame simulator
3. **Live Preview** → Lihat website dalam bentuk perangkat sebenarnya
4. **Interactive** → Resize, rotate, dan screenshot langsung

## 🚀 Penggunaan

### 1. **Install Extension**
```bash
1. Buka chrome://extensions
2. Enable "Developer mode"  
3. Click "Load unpacked"
4. Pilih folder Aspecta
```

### 2. **Menggunakan Visual Simulator**

#### **📱 Quick Start:**
```bash
1. 🔓 Buka website yang ingin ditest
2. 📱 Klik icon Aspecta di toolbar
3. 📋 Pilih device (iPhone SE, Galaxy S22, dll)
4. ✅ Klik "Apply Device Simulation"
5. 👀 Lihat preview dalam frame perangkat!
```

#### **🎨 Visual Preview Features:**
- **Device Frame**: Frame realistis sesuai jenis perangkat
- **Live Website**: Website dimuat langsung dalam frame
- **Orientation**: Toggle portrait/landscape dengan visual update
- **Device Info**: Label dan dimensi ditampilkan di bawah frame

#### **🔧 Advanced Controls:**
- **🔍 Fullscreen**: Buka simulator dalam window terpisah
- **📸 Screenshot**: Capture preview untuk dokumentasi
- **✕ Close**: Tutup device preview
- **⚙️ Custom Size**: Input dimensi manual dengan live preview

### 3. **Device Frame Styles**

```
🍎 iPhone Style          🤖 Android Style         📱 Tablet Style
┌─────────────────┐     ┌───────────────────┐    ┌─────────────────────┐
│ ╭─────────────╮ │     │ ┌───────────────┐ │    │ ┌─────────────────┐ │
│ │             │ │     │ │               │ │    │ │                 │ │
│ │   Website   │ │     │ │    Website    │ │    │ │     Website     │ │
│ │   Preview   │ │     │ │    Preview    │ │    │ │     Preview     │ │
│ │             │ │     │ │               │ │    │ │                 │ │
│ ╰─────────────╯ │     │ └───────────────┘ │    │ └─────────────────┘ │
│  iPhone SE      │     │   Galaxy S22      │    │    iPad Air         │
└─────────────────┘     └───────────────────┘    └─────────────────────┘
```

## 📱 Device Presets

### **🍎 iPhone Series**
- iPhone SE (375×667)
- iPhone 12/13/14 (390×844) 
- iPhone 14 Pro (393×852)
- iPhone 14 Pro Max (428×926)

### **🤖 Android Series**
- Galaxy S22 (360×780)
- Galaxy S22 Ultra (384×854)
- Google Pixel 7 (412×915)
- Google Pixel 7 Pro (412×892)

### **📱 Tablet Series**
- iPad Mini (768×1024)
- iPad Air (820×1180)
- iPad Pro 11" (834×1194)
- iPad Pro 12.9" (1024×1366)

## 🎨 Interface Overview

```
┌─────────────────────────────────────────────┐
│  📱 Aspecta Mobile Simulator                │
├─────────────────────────────────────────────┤
│  Device Preset: [iPhone SE ▼]              │
│  Width: [375] Height: [667]                 │
│  □ Landscape Mode  ☑ Mobile User Agent     │
│                                             │
│  [📱 Apply Device Simulation]               │
│  [🔄 Reset] [📸 Screenshot]                 │
│                                             │
│  ┌─────────── Device Preview ─────────────┐ │
│  │ [🔍] [✕]                              │ │
│  │ ┌─────────────────────────────────────┐ │ │
│  │ │ ╭─────────────────────────────────╮ │ │ │
│  │ │ │                                 │ │ │ │
│  │ │ │      Live Website Preview       │ │ │ │
│  │ │ │     dalam Frame iPhone SE       │ │ │ │
│  │ │ │                                 │ │ │ │
│  │ │ ╰─────────────────────────────────╯ │ │ │
│  │ └─────────────────────────────────────┘ │ │
│  │        iPhone SE • 375×667              │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### ❌ Common Issues & Solutions:

**"Failed to apply simulation"**
- ✅ Pastikan bukan di halaman `chrome://` atau `chrome-extension://`
- ✅ Gunakan website normal (google.com, github.com)
- ✅ Refresh halaman dan reload extension jika perlu

**Preview tidak muncul**
- ✅ Cek console browser (F12) untuk error messages
- ✅ Test dengan file `test.html` yang disediakan
- ✅ Pastikan browser tidak dalam fullscreen mode

**Device frame tidak sesuai**
- ✅ Coba berbagai device preset untuk melihat style yang berbeda
- ✅ Toggle landscape/portrait untuk melihat perubahan frame
- ✅ Gunakan fullscreen mode untuk preview yang lebih besar

### 🧪 Testing dengan Test File

Extension menyediakan `test.html` khusus untuk testing:
```bash
1. Apply simulation dengan device apapun
2. Preview akan otomatis load test.html jika halaman tidak supported
3. Test.html menampilkan informasi viewport real-time
4. Sempurna untuk memverifikasi extension bekerja dengan benar
```

## 📋 Technical Details

### **Architecture:**
- **Manifest V3** Chrome Extension
- **Content Script** untuk viewport manipulation
- **Background Service Worker** untuk user agent handling
- **Popup Interface** dengan embedded device simulator

### **Permissions:**
- `tabs` - Akses tab aktif untuk simulation
- `windows` - Resize window untuk fullscreen simulator
- `storage` - Simpan custom presets
- `activeTab` - Interaksi dengan halaman web

### **Supported Pages:**
- ✅ HTTP/HTTPS websites
- ✅ Local HTML files
- ✅ Extension test.html
- ❌ Chrome internal pages (chrome://, chrome-extension://)

## 🎯 Use Cases

- **👨‍💻 Web Developers**: Testing responsive design dengan preview visual
- **🧪 QA Testers**: Verifikasi tampilan di berbagai device sizes
- **🎨 UI/UX Designers**: Melihat design dalam konteks device frame
- **📱 Mobile Testing**: Simulasi mobile experience dengan user agent
- **📸 Documentation**: Screenshot untuk laporan testing

---

**✨ Aspecta - Making responsive testing visual and intuitive!**
