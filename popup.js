// Popup JS - Main functionality
class AspectaPopup {
    constructor() {
        this.devices = [];
        this.customPresets = [];
        this.currentTab = null;
        this.init();
    }    async init() {
        console.log('Aspecta Popup: Initializing...');
        
        try {
            await this.loadDevices();
            await this.loadCustomPresets();
            await this.getCurrentTab();
            this.setupEventListeners();
            this.populateDeviceSelect();
            this.renderCustomPresets();
            this.updateCurrentInfo();
            
            console.log('Aspecta Popup: Initialized successfully');
            this.setStatus('Ready', 'ready');
        } catch (error) {
            console.error('Aspecta Popup: Initialization failed:', error);
            this.setStatus('Initialization failed', 'error');
        }
    }    async loadDevices() {
        try {
            console.log('Aspecta Popup: Loading devices...');
            const response = await fetch(chrome.runtime.getURL('devices.json'));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.devices = await response.json();
            console.log('Aspecta Popup: Loaded', this.devices.length, 'devices');
        } catch (error) {
            console.error('Aspecta Popup: Failed to load devices:', error);
            this.devices = [];
            
            // Fallback devices if file loading fails
            this.devices = [
                {
                    label: "iPhone SE",
                    width: 375,
                    height: 667,
                    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
                },
                {
                    label: "iPhone 12/13/14",
                    width: 390,
                    height: 844,
                    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                },
                {
                    label: "Galaxy S22",
                    width: 360,
                    height: 780,
                    userAgent: "Mozilla/5.0 (Linux; Android 12; SM-S906B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36"
                },
                {
                    label: "iPad",
                    width: 768,
                    height: 1024,
                    userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                }
            ];
            console.log('Aspecta Popup: Using fallback devices');
        }
    }

    async loadCustomPresets() {
        try {
            const result = await chrome.storage.local.get(['customPresets']);
            this.customPresets = result.customPresets || [];
        } catch (error) {
            console.error('Failed to load custom presets:', error);
            this.customPresets = [];
        }
    }

    async saveCustomPresets() {
        try {
            await chrome.storage.local.set({ customPresets: this.customPresets });
        } catch (error) {
            console.error('Failed to save custom presets:', error);
        }
    }    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
            console.log('Aspecta Popup: Current tab:', tab?.url);
            
            if (!tab) {
                console.warn('Aspecta Popup: No active tab found');
            }
        } catch (error) {
            console.error('Aspecta Popup: Failed to get current tab:', error);
        }
    }

    setupEventListeners() {
        // Device select change
        document.getElementById('deviceSelect').addEventListener('change', (e) => {
            this.onDeviceSelect(e.target.value);
        });

        // Landscape toggle
        document.getElementById('landscapeToggle').addEventListener('change', (e) => {
            this.onOrientationToggle(e.target.checked);
        });

        // Apply button
        document.getElementById('applyBtn').addEventListener('click', () => {
            this.applySimulation();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSimulation();
        });        // Screenshot button
        document.getElementById('screenshotBtn').addEventListener('click', () => {
            this.takeScreenshot();
        });

        // Save preset button
        document.getElementById('savePresetBtn').addEventListener('click', () => {
            this.saveCurrentAsPreset();
        });

        // Simulator controls
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.openSimulatorInNewWindow();
        });

        document.getElementById('closeSimulatorBtn').addEventListener('click', () => {
            this.closeSimulator();
        });

        // Input changes
        document.getElementById('widthInput').addEventListener('input', () => {
            this.updateCurrentInfo();
            this.updateSimulatorIfActive();
        });

        document.getElementById('heightInput').addEventListener('input', () => {
            this.updateCurrentInfo();
            this.updateSimulatorIfActive();
        });
    }

    populateDeviceSelect() {
        const select = document.getElementById('deviceSelect');
        
        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                width: device.width,
                height: device.height,
                userAgent: device.userAgent
            });
            option.textContent = `${device.label} (${device.width}×${device.height})`;
            select.appendChild(option);
        });
    }

    onDeviceSelect(value) {
        if (!value) return;

        try {
            const device = JSON.parse(value);
            document.getElementById('widthInput').value = device.width;
            document.getElementById('heightInput').value = device.height;
            this.updateCurrentInfo();
        } catch (error) {
            console.error('Failed to parse device data:', error);
        }
    }

    onOrientationToggle(isLandscape) {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        
        if (widthInput.value && heightInput.value) {
            const width = parseInt(widthInput.value);
            const height = parseInt(heightInput.value);
            
            if (isLandscape) {
                // Switch to landscape (width > height)
                if (width < height) {
                    widthInput.value = height;
                    heightInput.value = width;
                }
            } else {
                // Switch to portrait (height > width)
                if (width > height) {
                    widthInput.value = height;
                    heightInput.value = width;                }
            }
            this.updateCurrentInfo();
            this.updateSimulatorIfActive();
        }
    }    async applySimulation() {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const userAgentToggle = document.getElementById('userAgentToggle');
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        if (!width || !height || width < 200 || height < 200) {
            this.setStatus('Please enter valid dimensions (min 200px)', 'error');
            return;
        }

        this.setStatus('Creating device simulator...', 'applying');
        this.setButtonsDisabled(true);

        try {
            // Ensure we have current tab
            if (!this.currentTab) {
                await this.getCurrentTab();
            }

            if (!this.currentTab) {
                throw new Error('No active tab found');
            }

            // Get device info for styling
            const deviceSelect = document.getElementById('deviceSelect');
            let deviceInfo = { label: 'Custom Device' };
            let userAgent = null;
            
            if (deviceSelect.value) {
                try {
                    const device = JSON.parse(deviceSelect.value);
                    const deviceData = this.devices.find(d => d.width === device.width && d.height === device.height);
                    if (deviceData) {
                        deviceInfo = deviceData;
                    }
                    
                    if (userAgentToggle.checked) {
                        userAgent = device.userAgent;
                    }
                } catch (e) {
                    console.warn('Could not parse device value:', e);
                }
            }

            // Use responsive window approach instead of iframe
            await this.createResponsiveWindow(width, height, deviceInfo, userAgent);
            this.showDeviceSimulator(width, height, deviceSelect.value);

            this.setStatus('Device simulator opened! Website loading in responsive window.', 'ready');
            this.updateCurrentInfo();
            
        } catch (error) {
            console.error('Failed to apply simulation:', error);
            let errorMessage = 'Failed to create simulator';
            
            if (error.message.includes('No active tab')) {
                errorMessage = 'No active tab found';
            } else if (error.message.includes('Extension context invalidated')) {
                errorMessage = 'Extension needs to be reloaded';
            } else if (error.message.includes('chrome://')) {
                errorMessage = 'Cannot simulate system pages. Please navigate to a regular website.';
            }
            
            this.setStatus(errorMessage, 'error');
        } finally {
            this.setButtonsDisabled(false);
        }
    }

    // Helper method to send message with timeout
    sendMessageWithTimeout(tabId, message, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Message timeout'));
            }, timeout);

            chrome.tabs.sendMessage(tabId, message, (response) => {
                clearTimeout(timer);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
    }    async resetSimulation() {
        this.setStatus('Resetting...', 'applying');
        this.setButtonsDisabled(true);

        try {
            // Close simulator window if it exists
            if (this.simulatorWindowId) {
                try {
                    await chrome.windows.remove(this.simulatorWindowId);
                    this.simulatorWindowId = null;
                } catch (error) {
                    console.warn('Could not close simulator window:', error);
                }
            }

            // Reset form
            document.getElementById('deviceSelect').value = '';
            document.getElementById('widthInput').value = '';
            document.getElementById('heightInput').value = '';
            document.getElementById('landscapeToggle').checked = false;

            this.setStatus('Reset complete', 'ready');
            this.updateCurrentInfo();
            
            // Hide device simulator preview
            this.closeSimulator();
            
        } catch (error) {
            console.error('Failed to reset simulation:', error);
            this.setStatus('Failed to reset simulation', 'error');
        } finally {            this.setButtonsDisabled(false);
        }
    }

    async takeScreenshot() {
        this.setStatus('Taking screenshot...', 'applying');
        
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, {
                format: 'png',
                quality: 100
            });

            // Create download link
            const link = document.createElement('a');
            link.download = `aspecta-screenshot-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            this.setStatus('Screenshot saved!', 'ready');
            
        } catch (error) {
            console.error('Failed to take screenshot:', error);
            this.setStatus('Failed to take screenshot', 'error');
        }
    }

    saveCurrentAsPreset() {
        const width = parseInt(document.getElementById('widthInput').value);
        const height = parseInt(document.getElementById('heightInput').value);
        
        if (!width || !height) {
            this.setStatus('Please enter dimensions first', 'error');
            return;
        }

        const name = prompt('Enter preset name:', `${width}×${height}`);
        if (!name) return;

        const preset = { name, width, height };
        
        // Check if preset already exists
        const existingIndex = this.customPresets.findIndex(p => p.name === name);
        if (existingIndex >= 0) {
            this.customPresets[existingIndex] = preset;
        } else {
            this.customPresets.push(preset);
        }

        this.saveCustomPresets();
        this.renderCustomPresets();
        this.setStatus('Preset saved!', 'ready');
    }

    renderCustomPresets() {
        const container = document.getElementById('customPresets');
        container.innerHTML = '';

        this.customPresets.forEach((preset, index) => {
            const presetEl = document.createElement('div');
            presetEl.className = 'preset-item';
            presetEl.innerHTML = `
                <span>${preset.name}</span>
                <span class="preset-delete" data-index="${index}">×</span>
            `;
            
            presetEl.addEventListener('click', (e) => {
                if (!e.target.classList.contains('preset-delete')) {
                    document.getElementById('widthInput').value = preset.width;
                    document.getElementById('heightInput').value = preset.height;
                    this.updateCurrentInfo();
                }
            });

            const deleteBtn = presetEl.querySelector('.preset-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePreset(index);
            });

            container.appendChild(presetEl);
        });
    }

    deletePreset(index) {
        this.customPresets.splice(index, 1);
        this.saveCustomPresets();
        this.renderCustomPresets();
    }

    updateCurrentInfo() {
        const width = document.getElementById('widthInput').value;
        const height = document.getElementById('heightInput').value;
        const currentDimensions = document.getElementById('currentDimensions');
        
        if (width && height) {
            currentDimensions.textContent = `${width}×${height}`;
        } else {
            currentDimensions.textContent = '-';
        }
    }

    setStatus(message, type) {
        const statusElement = document.getElementById('statusText');
        statusElement.textContent = message;
        statusElement.className = `status-${type}`;
        
        if (type === 'ready' || type === 'error') {
            setTimeout(() => {
                statusElement.textContent = 'Ready';
                statusElement.className = 'status-ready';
            }, 3000);
        }
    }

    setButtonsDisabled(disabled) {
        const buttons = ['applyBtn', 'resetBtn', 'screenshotBtn', 'savePresetBtn'];
        buttons.forEach(id => {
            document.getElementById(id).disabled = disabled;
        });
    }

    showDeviceSimulator(width, height, deviceValue) {
        console.log('Aspecta Popup: Showing device simulator', width, height);
        
        // Parse device info
        let deviceInfo = { label: 'Custom Device' };
        if (deviceValue) {
            try {
                const device = JSON.parse(deviceValue);
                const deviceData = this.devices.find(d => d.width === device.width && d.height === device.height);
                if (deviceData) {
                    deviceInfo = deviceData;
                }
            } catch (e) {
                console.warn('Could not parse device value:', e);
            }
        }

        // Show simulator section
        const simulatorSection = document.getElementById('simulatorSection');
        simulatorSection.classList.add('show');

        // Update device info
        document.getElementById('deviceLabel').textContent = deviceInfo.label;
        document.getElementById('deviceDimensions').textContent = `${width}×${height}`;

        // Set device frame style based on device type
        const deviceFrame = document.getElementById('deviceFrame');
        deviceFrame.className = 'device-frame';
        
        if (deviceInfo.label.toLowerCase().includes('iphone') || deviceInfo.label.toLowerCase().includes('ios')) {
            deviceFrame.classList.add('iphone');
        } else if (deviceInfo.label.toLowerCase().includes('galaxy') || deviceInfo.label.toLowerCase().includes('pixel') || deviceInfo.label.toLowerCase().includes('android')) {
            deviceFrame.classList.add('android');
        } else if (deviceInfo.label.toLowerCase().includes('ipad') || width > 600) {
            deviceFrame.classList.add('tablet');
        }

        // Set screen orientation
        const deviceScreen = document.getElementById('deviceScreen');
        const isLandscape = document.getElementById('landscapeToggle').checked;
        if (isLandscape) {
            deviceScreen.classList.add('landscape');
        } else {
            deviceScreen.classList.remove('landscape');
        }

        // Load current tab in iframe
        this.loadCurrentTabInSimulator();
    }    async loadCurrentTabInSimulator() {
        const iframe = document.getElementById('simulatorIframe');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        // Show loading
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading live website...</p>
            <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                Please wait while we load the interactive website
            </div>
        `;

        try {
            if (this.currentTab && this.currentTab.url) {
                // Check if URL is accessible for iframe
                if (this.currentTab.url.startsWith('chrome://') || 
                    this.currentTab.url.startsWith('chrome-extension://') ||
                    this.currentTab.url.startsWith('edge://') ||
                    this.currentTab.url.startsWith('about:')) {
                    
                    // Show message for unsupported URLs
                    loadingOverlay.innerHTML = `
                        <div style="text-align: center; color: #ef4444;">
                            <div style="font-size: 24px; margin-bottom: 12px;">⚠️</div>
                            <p><strong>Cannot Load System Pages</strong></p>
                            <p style="font-size: 12px; margin-top: 8px;">
                                Please navigate to a regular website to test responsiveness.
                            </p>
                            <button onclick="window.open('${chrome.runtime.getURL('test-new.html')}', '_blank')" 
                                    style="margin-top: 10px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Open Test Page
                            </button>
                        </div>
                    `;
                    return;
                }

                // Show iframe and load website directly
                iframe.style.display = 'block';
                console.log('Loading live website in iframe:', this.currentTab.url);
                
                // Set user agent if needed
                const userAgent = this.getUserAgentFromDevice();
                if (userAgent) {
                    console.log('Setting user agent for iframe:', userAgent);
                    // Note: User agent changes would need to be applied to the simulator window
                }
                
                // Load website directly in iframe
                iframe.src = this.currentTab.url;
                
                // Handle iframe load events
                const handleIframeLoad = () => {
                    console.log('Iframe loaded successfully');
                    setTimeout(() => {
                        loadingOverlay.classList.add('hidden');
                    }, 500);
                    iframe.removeEventListener('load', handleIframeLoad);
                };
                
                const handleIframeError = () => {
                    console.warn('Iframe failed to load, might be due to X-Frame-Options');
                    loadingOverlay.innerHTML = `
                        <div style="text-align: center; color: #ef4444;">
                            <div style="font-size: 24px; margin-bottom: 12px;">🔒</div>
                            <p><strong>Website Blocked Iframe Loading</strong></p>
                            <p style="font-size: 12px; margin-top: 8px;">
                                This website doesn't allow iframe embedding.<br>
                                Click the button below to open in a new window.
                            </p>
                            <button onclick="window.open('${this.currentTab.url}', '_blank', 'width=${parseInt(document.getElementById('widthInput').value)},height=${parseInt(document.getElementById('heightInput').value)}')" 
                                    style="margin-top: 10px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Open in New Window
                            </button>
                        </div>
                    `;
                    iframe.removeEventListener('error', handleIframeError);
                };
                
                iframe.addEventListener('load', handleIframeLoad);
                iframe.addEventListener('error', handleIframeError);
                
                // Fallback timeout in case iframe gets stuck
                setTimeout(() => {
                    if (!loadingOverlay.classList.contains('hidden')) {
                        console.warn('Iframe loading timeout, checking if content loaded');
                        
                        try {
                            // Try to detect if iframe has content
                            if (iframe.contentDocument || iframe.contentWindow) {
                                console.log('Iframe has content, hiding loading overlay');
                                loadingOverlay.classList.add('hidden');
                            } else {                        // Show fallback option
                        loadingOverlay.innerHTML = `
                            <div style="text-align: center; color: #f59e0b;">
                                <div style="font-size: 24px; margin-bottom: 12px;">⏱️</div>
                                <p><strong>Website Loading</strong></p>
                                <p style="font-size: 12px; margin-top: 8px;">
                                    The website is loading in the iframe.<br>
                                    This is normal for live interactive preview.
                                </p>
                                <button onclick="window.open('${this.currentTab.url}', '_blank', 'width=${parseInt(document.getElementById('widthInput').value)},height=${parseInt(document.getElementById('heightInput').value)}')" 
                                        style="margin-top: 10px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    Open in New Window
                                </button>
                            </div>
                        `;
                            }
                        } catch (e) {
                            console.warn('Cannot access iframe content due to cross-origin restrictions');
                            loadingOverlay.classList.add('hidden'); // Assume it loaded
                        }
                    }
                }, 10000); // 10 second timeout
                
            } else {
                loadingOverlay.innerHTML = `
                    <div style="text-align: center; color: #6b7280;">
                        <div style="font-size: 24px; margin-bottom: 12px;">📄</div>
                        <p><strong>No Website Found</strong></p>
                        <p style="font-size: 12px; margin-top: 8px;">
                            Please navigate to a website first.
                        </p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load tab in simulator:', error);
            loadingOverlay.innerHTML = `
                <div style="text-align: center; color: #ef4444;">
                    <div style="font-size: 24px; margin-bottom: 12px;">❌</div>
                    <p><strong>Preview Error</strong></p>
                    <p style="font-size: 12px; margin-top: 8px;">
                        ${error.message}
                    </p>
                </div>
            `;
        }
    }

    getUserAgentFromDevice() {
        const deviceSelect = document.getElementById('deviceSelect');
        const userAgentToggle = document.getElementById('userAgentToggle');
        
        if (userAgentToggle.checked && deviceSelect.value) {
            try {
                const device = JSON.parse(deviceSelect.value);
                return device.userAgent;
            } catch (e) {
                console.warn('Could not parse device user agent:', e);
            }
        }
        return null;
    }

    updateSimulatorIfActive() {
        const simulatorSection = document.getElementById('simulatorSection');
        if (simulatorSection.classList.contains('show')) {
            const width = parseInt(document.getElementById('widthInput').value);
            const height = parseInt(document.getElementById('heightInput').value);
            
            if (width && height) {
                document.getElementById('deviceDimensions').textContent = `${width}×${height}`;
                
                // Update screen orientation
                const deviceScreen = document.getElementById('deviceScreen');
                const isLandscape = document.getElementById('landscapeToggle').checked;
                if (isLandscape) {
                    deviceScreen.classList.add('landscape');
                } else {
                    deviceScreen.classList.remove('landscape');
                }
            }
        }
    }

    closeSimulator() {
        const simulatorSection = document.getElementById('simulatorSection');
        simulatorSection.classList.remove('show');
        
        // Clear iframe
        document.getElementById('simulatorIframe').src = '';
    }

    async openSimulatorInNewWindow() {
        const width = parseInt(document.getElementById('widthInput').value);
        const height = parseInt(document.getElementById('heightInput').value);
        
        if (!width || !height) {
            this.setStatus('Please set dimensions first', 'error');
            return;
        }

        try {
            const currentUrl = this.currentTab?.url || chrome.runtime.getURL('test.html');
            
            // Open new window with specific dimensions
            const newWindow = await chrome.windows.create({
                url: currentUrl,
                type: 'popup',
                width: width + 40, // Add some padding for window chrome
                height: height + 80,
                left: 100,
                top: 100
            });

            this.setStatus('Opened in new window', 'ready');
            
        } catch (error) {
            console.error('Failed to open simulator window:', error);
            this.setStatus('Failed to open new window', 'error');
        }
    }    async createSimulatorWindow(width, height, deviceInfo, userAgent) {
        try {
            console.log('Aspecta: Creating simulator window for', deviceInfo.label);
            console.log('Aspecta: Current tab URL:', this.currentTab?.url);
            console.log('Aspecta: Dimensions:', width, 'x', height);
            console.log('Aspecta: User Agent:', userAgent?.slice(0, 50) + '...');
            
            // Calculate window dimensions with device frame padding
            const frameWidth = width + 80;  // Extra space for device frame
            const frameHeight = height + 160; // Extra space for device frame + title bar

            // Create URL for simulator with parameters
            const simulatorUrl = chrome.runtime.getURL('simulator.html') + 
                `?width=${width}&height=${height}` +
                `&device=${encodeURIComponent(deviceInfo.label)}` +
                `&type=${this.getDeviceFrameClass(deviceInfo.label)}` +
                `&url=${encodeURIComponent(this.currentTab.url)}` +
                `&userAgent=${encodeURIComponent(userAgent || '')}`;
            
            console.log('Aspecta: Opening simulator URL:', simulatorUrl);
            console.log('Aspecta: URL length:', simulatorUrl.length);
            
            // Validate current tab URL
            if (!this.currentTab.url || this.currentTab.url.startsWith('chrome://')) {
                throw new Error('Cannot simulate chrome:// or system pages. Please navigate to a regular website.');
            }
            
            console.log('Aspecta: Creating window with dimensions:', frameWidth, 'x', frameHeight);
            
            // Open simulator in new window
            const simulatorWindow = await chrome.windows.create({
                url: simulatorUrl,
                type: 'popup',
                width: Math.min(frameWidth, 800),
                height: Math.min(frameHeight, 900),
                left: 100,
                top: 100
            });

            // Store window ID for later reference
            this.simulatorWindowId = simulatorWindow.id;
            
            console.log('Aspecta: Simulator window created with ID:', simulatorWindow.id);
            console.log('Aspecta: Window tabs:', simulatorWindow.tabs?.length || 0);
            
            // Set a timeout to check if window opened properly
            setTimeout(() => {
                chrome.windows.get(simulatorWindow.id, (window) => {
                    if (chrome.runtime.lastError) {
                        console.error('Aspecta: Simulator window check failed:', chrome.runtime.lastError);
                    } else {
                        console.log('Aspecta: Simulator window still exists after 3s');
                    }
                });
            }, 3000);
            
        } catch (error) {
            console.error('Failed to create simulator window:', error);
            throw error;
        }}

    getDeviceFrameClass(deviceLabel) {
        const label = deviceLabel.toLowerCase();
        if (label.includes('iphone') || label.includes('ios')) return 'iphone';
        if (label.includes('galaxy') || label.includes('pixel') || label.includes('android')) return 'android';
        if (label.includes('ipad') || label.includes('tablet')) return 'tablet';
        return 'android'; // default
    }    showLocalDevicePreview(width, height, deviceInfo) {
        // Show simple preview in popup
        const simulatorSection = document.getElementById('simulatorSection');
        simulatorSection.classList.add('show');

        document.getElementById('deviceLabel').textContent = deviceInfo.label;
        document.getElementById('deviceDimensions').textContent = `${width}×${height}`;

        // Update device frame style
        const deviceFrame = document.getElementById('deviceFrame');
        const frameClass = this.getDeviceFrameClass(deviceInfo.label);
        deviceFrame.className = `device-frame ${frameClass}`;

        // Show message instead of iframe
        const iframe = document.getElementById('simulatorIframe');
        iframe.style.display = 'none';
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.innerHTML = `
            <div style="text-align: center; color: #374151;">
                <div style="font-size: 24px; margin-bottom: 12px;">📱</div>
                <p><strong>Simulator Window Opened!</strong></p>
                <p style="font-size: 12px; margin-top: 8px; color: #6b7280;">
                    Check the new window for device preview.<br>
                    The website will load automatically.
                </p>
            </div>
        `;
        loadingOverlay.classList.remove('hidden');
    }    async createResponsiveWindow(width, height, deviceInfo, userAgent) {
        try {
            console.log('Aspecta: Creating responsive window for', deviceInfo.label);
            console.log('Aspecta: Current tab URL:', this.currentTab?.url);
            console.log('Aspecta: Dimensions:', width, 'x', height);
            console.log('Aspecta: User Agent:', userAgent);
            
            // Validate current tab URL
            if (!this.currentTab.url || this.currentTab.url.startsWith('chrome://')) {
                throw new Error('Cannot simulate chrome:// or system pages. Please navigate to a regular website.');
            }
            
            // Create a new window with the exact dimensions needed
            const newWindow = await chrome.windows.create({
                url: this.currentTab.url,
                type: 'popup',
                width: width + 20,  // Add small padding for scrollbars
                height: height + 60, // Add padding for browser chrome
                left: 100,
                top: 100,
                focused: true
            });

            console.log('Aspecta: Responsive window created with ID:', newWindow.id);
            
            // Store window ID for later reference
            this.simulatorWindowId = newWindow.id;
            
            // Apply user agent if specified
            if (userAgent && userAgent.trim() && newWindow.tabs && newWindow.tabs[0]) {
                console.log('Aspecta: Applying user agent to new window...');
                
                try {
                    // Send message to background to set user agent
                    await chrome.runtime.sendMessage({
                        action: 'setUserAgent',
                        tabId: newWindow.tabs[0].id,
                        userAgent: userAgent
                    });
                    
                    console.log('Aspecta: User agent applied successfully');
                    
                    // Reload the tab to apply user agent
                    setTimeout(async () => {
                        try {
                            await chrome.tabs.reload(newWindow.tabs[0].id);
                            console.log('Aspecta: Tab reloaded with new user agent');
                        } catch (error) {
                            console.warn('Aspecta: Failed to reload tab:', error);
                        }
                    }, 500);
                    
                } catch (error) {
                    console.warn('Aspecta: Failed to set user agent:', error);
                }
            }
            
            // Inject responsive viewport meta tag for better mobile rendering
            if (newWindow.tabs && newWindow.tabs[0]) {
                setTimeout(async () => {
                    try {
                        await chrome.tabs.executeScript(newWindow.tabs[0].id, {
                            code: `
                                // Add or update viewport meta tag for responsive design
                                let viewport = document.querySelector('meta[name="viewport"]');
                                if (!viewport) {
                                    viewport = document.createElement('meta');
                                    viewport.name = 'viewport';
                                    document.head.appendChild(viewport);
                                }
                                viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
                                
                                // Add device simulation indicator
                                const indicator = document.createElement('div');
                                indicator.style.cssText = \`
                                    position: fixed; 
                                    top: 0; 
                                    left: 0; 
                                    background: rgba(33, 150, 243, 0.9); 
                                    color: white; 
                                    padding: 8px 12px; 
                                    font: 12px Arial; 
                                    z-index: 999999; 
                                    border-radius: 0 0 8px 0;
                                    pointer-events: none;
                                \`;
                                indicator.textContent = '📱 ${deviceInfo.label} (${width}×${height})';
                                document.body.appendChild(indicator);
                                
                                // Auto-hide indicator after 3 seconds
                                setTimeout(() => {
                                    if (indicator.parentNode) {
                                        indicator.style.opacity = '0';
                                        indicator.style.transition = 'opacity 0.5s';
                                        setTimeout(() => indicator.remove(), 500);
                                    }
                                }, 3000);
                                
                                console.log('Aspecta: Device simulation active - ${deviceInfo.label}');
                            `
                        });
                        console.log('Aspecta: Responsive viewport and indicator injected');
                    } catch (error) {
                        console.warn('Aspecta: Failed to inject responsive code:', error);
                    }
                }, 2000); // Wait 2 seconds for page to load
            }
            
        } catch (error) {
            console.error('Failed to create responsive window:', error);
            throw error;
        }
    }

    // ...existing code...
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AspectaPopup();
});
