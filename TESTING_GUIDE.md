# 🧪 Testing Instructions - Aspecta v1.0.1

## 📋 Quick Test Checklist

### ✅ Step 1: Installation Test
1. Buka `chrome://extensions` atau `edge://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → Pilih folder Aspecta
4. ✅ **Verify**: Icon Aspecta muncul di toolbar
5. ✅ **Verify**: No error di extension list

### ✅ Step 2: Basic Functionality Test
1. **Navigate to any website** (contoh: google.com, github.com)
2. **Click Aspecta icon** di toolbar
3. ✅ **Verify**: Popup terbuka dengan device list
4. ✅ **Verify**: Status menunjukkan "Ready"
5. ✅ **Verify**: Device dropdown ter-populate dengan pilihan

### ✅ Step 3: Device Simulation Test
1. **Select device** dari dropdown (contoh: "iPhone SE")
2. ✅ **Verify**: Width/Height fields ter-isi otomatis (375×667)
3. **Click "Open Device Simulator"**
4. ✅ **Verify**: Status berubah ke "Creating device simulator..."
5. ✅ **Verify**: New window terbuka dengan device simulator
6. ✅ **Verify**: Website screenshot muncul dalam 5-15 detik

### ✅ Step 4: Custom Dimensions Test
1. **Clear device selection**
2. **Input custom dimensions** (contoh: Width: 800, Height: 600)
3. **Click "Open Device Simulator"**
4. ✅ **Verify**: Simulator window dengan custom size
5. ✅ **Verify**: Screenshot capturing berfungsi

### ✅ Step 5: Features Test
1. **Toggle Landscape Mode** ✅ Verify: Dimensions swap
2. **Toggle Mobile User Agent** ✅ Verify: Setting applied
3. **Click Screenshot button** ✅ Verify: File downloads
4. **Save custom preset** ✅ Verify: Preset tersimpan
5. **Reset simulation** ✅ Verify: Form cleared

## 🔍 Detailed Testing Scenarios

### Scenario A: Regular Website Testing
```bash
Target: https://github.com
Device: iPhone 12/13/14 (390×844)
Expected: Screenshot preview dalam device frame
Timeout: 15 seconds maximum
```

### Scenario B: HTTPS Site Testing  
```bash
Target: https://stackoverflow.com
Device: Galaxy S22 (360×780)
Expected: Proper screenshot capture
Note: Test user agent simulation
```

### Scenario C: System Page Testing
```bash
Target: chrome://extensions
Expected: Error message dengan option ke test page
Behavior: "Cannot preview system pages" message
```

### Scenario D: Custom Dimensions Testing
```bash
Target: Any responsive website
Dimensions: 1200×800 (custom)
Expected: Large tablet-like preview
Note: Test both portrait dan landscape
```

## 🐛 Troubleshooting Tests

### Test 1: Extension Communication
**Symptoms**: "Extension communication error"
**Steps**: 
1. Reload extension di chrome://extensions
2. Try simulation again
3. ✅ **Expected**: Communication restored

### Test 2: Screenshot Timeout
**Symptoms**: "Screenshot capture timeout"
**Steps**:
1. Wait for auto-retry (3 seconds)
2. Manual click 📸 button if needed
3. ✅ **Expected**: Retry mechanism works

### Test 3: Invalid URL
**Symptoms**: Cannot simulate chrome:// pages
**Steps**:
1. Navigate to chrome://settings
2. Try simulation
3. ✅ **Expected**: Clear error message + test page option

## 📊 Performance Benchmarks

### Loading Times (Expected):
- **Extension popup**: < 1 second
- **Device list loading**: < 2 seconds  
- **Screenshot capture**: 3-15 seconds
- **Window creation**: < 2 seconds

### Memory Usage (Expected):
- **Extension**: < 10MB
- **Simulator window**: < 50MB
- **Background process**: < 5MB

## ✅ Success Criteria

### Core Functionality ✅
- [x] Device selection works
- [x] Screenshot preview displays  
- [x] Custom dimensions work
- [x] Orientation toggle functions
- [x] Simulator window opens

### Error Handling ✅
- [x] System pages show proper error
- [x] Timeout scenarios handled
- [x] Network failures managed
- [x] Extension reload recovery

### User Experience ✅
- [x] Loading indicators clear
- [x] Error messages helpful
- [x] Auto-retry mechanism
- [x] Responsive UI design

## 🚀 Final Verification

After completing all tests, verify:

1. **✅ No console errors** di browser DevTools
2. **✅ Extension permissions** working properly
3. **✅ Multiple devices** dapat di-simulate
4. **✅ Screenshot quality** acceptable
5. **✅ Window management** stable

---

## 🎯 Test Results Template

```
Test Date: [DATE]
Browser: [Chrome/Edge] Version [XX]
OS: [Windows/Mac/Linux]

✅ Installation: [PASS/FAIL]
✅ Basic Functionality: [PASS/FAIL]  
✅ Device Simulation: [PASS/FAIL]
✅ Custom Dimensions: [PASS/FAIL]
✅ Features Test: [PASS/FAIL]
✅ Error Handling: [PASS/FAIL]

Overall Status: [PASS/FAIL]
Notes: [Any issues or observations]
```

**Happy Testing! 🧪✨**
