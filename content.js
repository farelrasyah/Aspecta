// Content Script - Handles viewport manipulation and user agent
class AspectaContentScript {
    constructor() {
        this.originalUserAgent = navigator.userAgent;
        this.originalViewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.isSimulating = false;
        this.init();
    }

    init() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Store original dimensions on load
        this.storeOriginalDimensions();
        
        // Add custom styles for better mobile simulation
        this.addSimulationStyles();
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'simulateDevice':
                this.simulateDevice(message.width, message.height, message.userAgent)
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;
                
            case 'resetSimulation':
                this.resetSimulation()
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;
                
            case 'getCurrentDimensions':
                sendResponse({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    isSimulating: this.isSimulating
                });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }

    async simulateDevice(width, height, userAgent) {
        try {
            this.isSimulating = true;
            
            // Apply viewport simulation
            await this.setViewportSize(width, height);
            
            // Apply user agent simulation if provided
            if (userAgent) {
                this.setUserAgent(userAgent);
            }
            
            // Trigger responsive design updates
            this.triggerResponsiveUpdates();
            
            // Add visual indicator
            this.showSimulationIndicator(width, height);
            
            console.log(`Aspecta: Simulating ${width}×${height} viewport`);
            
        } catch (error) {
            this.isSimulating = false;
            throw error;
        }
    }

    async resetSimulation() {
        try {
            this.isSimulating = false;
            
            // Reset viewport
            this.resetViewportSize();
            
            // Reset user agent
            this.resetUserAgent();
            
            // Trigger responsive design updates
            this.triggerResponsiveUpdates();
            
            // Remove visual indicator
            this.hideSimulationIndicator();
            
            console.log('Aspecta: Simulation reset');
            
        } catch (error) {
            throw error;
        }
    }

    setViewportSize(width, height) {
        return new Promise((resolve) => {
            // Create or update viewport meta tag
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                viewportMeta = document.createElement('meta');
                viewportMeta.name = 'viewport';
                document.head.appendChild(viewportMeta);
            }
            
            // Store original viewport content
            if (!viewportMeta.hasAttribute('data-aspecta-original')) {
                viewportMeta.setAttribute('data-aspecta-original', viewportMeta.content || '');
            }
            
            // Set new viewport
            viewportMeta.content = `width=${width}, height=${height}, initial-scale=1.0, user-scalable=yes`;
            
            // Apply CSS to simulate viewport
            this.applyViewportStyles(width, height);
            
            // Dispatch resize event
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                resolve();
            }, 100);
        });
    }

    applyViewportStyles(width, height) {
        let styleEl = document.getElementById('aspecta-viewport-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'aspecta-viewport-styles';
            document.head.appendChild(styleEl);
        }

        styleEl.textContent = `
            /* Aspecta Viewport Simulation */
            html, body {
                max-width: ${width}px !important;
                overflow-x: auto !important;
            }
            
            body {
                margin: 0 auto !important;
                box-sizing: border-box !important;
            }
            
            /* Force mobile-like behavior */
            * {
                -webkit-text-size-adjust: 100% !important;
                -ms-text-size-adjust: 100% !important;
            }
            
            /* Hide horizontal scrollbar on body */
            body::-webkit-scrollbar:horizontal {
                display: none;
            }
            
            /* Responsive images */
            img {
                max-width: 100% !important;
                height: auto !important;
            }
            
            /* Responsive tables */
            table {
                max-width: 100% !important;
                word-wrap: break-word !important;
            }
        `;
    }

    setUserAgent(userAgent) {
        // Store original user agent
        if (!window.aspectaOriginalUserAgent) {
            window.aspectaOriginalUserAgent = navigator.userAgent;
        }

        // Override navigator.userAgent
        try {
            Object.defineProperty(navigator, 'userAgent', {
                get: function() { return userAgent; },
                configurable: true
            });
        } catch (e) {
            console.warn('Could not override user agent:', e);
        }

        // Set user agent in request headers via background script
        chrome.runtime.sendMessage({
            action: 'setUserAgent',
            userAgent: userAgent,
            tabId: this.getTabId()
        });
    }

    resetViewportSize() {
        // Reset viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta && viewportMeta.hasAttribute('data-aspecta-original')) {
            const originalContent = viewportMeta.getAttribute('data-aspecta-original');
            if (originalContent) {
                viewportMeta.content = originalContent;
            } else {
                viewportMeta.remove();
            }
            viewportMeta.removeAttribute('data-aspecta-original');
        }

        // Remove viewport styles
        const styleEl = document.getElementById('aspecta-viewport-styles');
        if (styleEl) {
            styleEl.remove();
        }

        // Dispatch resize event
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    resetUserAgent() {
        // Reset user agent
        if (window.aspectaOriginalUserAgent) {
            try {
                Object.defineProperty(navigator, 'userAgent', {
                    get: function() { return window.aspectaOriginalUserAgent; },
                    configurable: true
                });
            } catch (e) {
                console.warn('Could not reset user agent:', e);
            }
        }

        // Reset user agent in request headers
        chrome.runtime.sendMessage({
            action: 'resetUserAgent',
            tabId: this.getTabId()
        });
    }

    triggerResponsiveUpdates() {
        // Trigger various events that responsive designs listen to
        const events = ['resize', 'orientationchange', 'load'];
        events.forEach(eventType => {
            window.dispatchEvent(new Event(eventType));
        });

        // Trigger media query updates
        if (window.matchMedia) {
            const mediaQueries = [
                '(max-width: 768px)',
                '(max-width: 480px)',
                '(orientation: portrait)',
                '(orientation: landscape)'
            ];
            
            mediaQueries.forEach(query => {
                const mq = window.matchMedia(query);
                if (mq.dispatchEvent) {
                    mq.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    showSimulationIndicator(width, height) {
        // Remove existing indicator
        this.hideSimulationIndicator();

        // Create indicator
        const indicator = document.createElement('div');
        indicator.id = 'aspecta-indicator';
        indicator.innerHTML = `
            <div class="aspecta-indicator-content">
                <span class="aspecta-icon">📱</span>
                <span class="aspecta-text">Aspecta: ${width}×${height}</span>
                <button class="aspecta-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #aspecta-indicator {
                position: fixed !important;
                top: 10px !important;
                right: 10px !important;
                z-index: 999999 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                pointer-events: auto !important;
            }
            
            .aspecta-indicator-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: white !important;
                padding: 8px 12px !important;
                border-radius: 20px !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                animation: aspectaSlideIn 0.3s ease-out !important;
            }
            
            .aspecta-icon {
                font-size: 14px !important;
            }
            
            .aspecta-close {
                background: rgba(255,255,255,0.2) !important;
                border: none !important;
                color: white !important;
                width: 18px !important;
                height: 18px !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                font-size: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin-left: 6px !important;
            }
            
            .aspecta-close:hover {
                background: rgba(255,255,255,0.3) !important;
            }
            
            @keyframes aspectaSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(indicator);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.getElementById('aspecta-indicator')) {
                indicator.style.animation = 'aspectaSlideIn 0.3s ease-out reverse';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 5000);
    }

    hideSimulationIndicator() {
        const indicator = document.getElementById('aspecta-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    addSimulationStyles() {
        const style = document.createElement('style');
        style.id = 'aspecta-base-styles';
        style.textContent = `
            /* Aspecta Base Simulation Styles */
            .aspecta-simulating * {
                box-sizing: border-box !important;
            }
        `;
        document.head.appendChild(style);
    }

    storeOriginalDimensions() {
        // Store in session storage for persistence
        sessionStorage.setItem('aspecta-original-width', window.innerWidth.toString());
        sessionStorage.setItem('aspecta-original-height', window.innerHeight.toString());
    }

    getTabId() {
        // Get current tab ID (this would need to be passed from background script)
        return new URLSearchParams(location.search).get('tabId') || null;
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AspectaContentScript();
    });
} else {
    new AspectaContentScript();
}
