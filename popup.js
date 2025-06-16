// Popup JS - Main functionality
class AspectaPopup {
    constructor() {
        this.devices = [];
        this.customPresets = [];
        this.currentTab = null;
        this.init();
    }

    async init() {
        await this.loadDevices();
        await this.loadCustomPresets();
        await this.getCurrentTab();
        this.setupEventListeners();
        this.populateDeviceSelect();
        this.renderCustomPresets();
        this.updateCurrentInfo();
    }

    async loadDevices() {
        try {
            const response = await fetch('devices.json');
            this.devices = await response.json();
        } catch (error) {
            console.error('Failed to load devices:', error);
            this.devices = [];
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
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('Failed to get current tab:', error);
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
        });

        // Screenshot button
        document.getElementById('screenshotBtn').addEventListener('click', () => {
            this.takeScreenshot();
        });

        // Save preset button
        document.getElementById('savePresetBtn').addEventListener('click', () => {
            this.saveCurrentAsPreset();
        });

        // Input changes
        document.getElementById('widthInput').addEventListener('input', () => {
            this.updateCurrentInfo();
        });

        document.getElementById('heightInput').addEventListener('input', () => {
            this.updateCurrentInfo();
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
                    heightInput.value = width;
                }
            }
            this.updateCurrentInfo();
        }
    }

    async applySimulation() {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const userAgentToggle = document.getElementById('userAgentToggle');
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        if (!width || !height || width < 200 || height < 200) {
            this.setStatus('Please enter valid dimensions (min 200px)', 'error');
            return;
        }

        this.setStatus('Applying simulation...', 'applying');
        this.setButtonsDisabled(true);

        try {
            // Get current window
            const currentWindow = await chrome.windows.getCurrent();
            
            // Calculate window dimensions (adding browser chrome)
            const windowWidth = width + 20; // Add some padding for browser chrome
            const windowHeight = height + 120; // Add space for address bar, tabs, etc.

            // Update window size
            await chrome.windows.update(currentWindow.id, {
                width: windowWidth,
                height: windowHeight
            });

            // Send message to content script to update viewport and user agent
            const deviceSelect = document.getElementById('deviceSelect');
            let userAgent = null;
            
            if (userAgentToggle.checked && deviceSelect.value) {
                try {
                    const device = JSON.parse(deviceSelect.value);
                    userAgent = device.userAgent;
                } catch (e) {
                    // Use default mobile user agent
                    userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
                }
            }

            if (this.currentTab) {
                await chrome.tabs.sendMessage(this.currentTab.id, {
                    action: 'simulateDevice',
                    width: width,
                    height: height,
                    userAgent: userAgent
                });
            }

            this.setStatus('Simulation applied successfully!', 'ready');
            this.updateCurrentInfo();
            
        } catch (error) {
            console.error('Failed to apply simulation:', error);
            this.setStatus('Failed to apply simulation', 'error');
        } finally {
            this.setButtonsDisabled(false);
        }
    }

    async resetSimulation() {
        this.setStatus('Resetting...', 'applying');
        this.setButtonsDisabled(true);

        try {
            if (this.currentTab) {
                await chrome.tabs.sendMessage(this.currentTab.id, {
                    action: 'resetSimulation'
                });
            }

            // Reset form
            document.getElementById('deviceSelect').value = '';
            document.getElementById('widthInput').value = '';
            document.getElementById('heightInput').value = '';
            document.getElementById('landscapeToggle').checked = false;

            this.setStatus('Reset complete', 'ready');
            this.updateCurrentInfo();
            
        } catch (error) {
            console.error('Failed to reset simulation:', error);
            this.setStatus('Failed to reset simulation', 'error');
        } finally {
            this.setButtonsDisabled(false);
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
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AspectaPopup();
});
