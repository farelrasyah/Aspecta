// Background Service Worker
class AspectaBackground {
    constructor() {
        this.userAgentRules = new Map();
        this.init();
    }

    init() {
        // Listen for extension installation
        chrome.runtime.onInstalled.addListener(() => {
            console.log('Aspecta Mobile Simulator installed');
        });

        // Listen for messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.onTabComplete(tabId, tab);
            }
        });

        // Handle window creation
        chrome.windows.onCreated.addListener((window) => {
            this.onWindowCreated(window);
        });
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'setUserAgent':
                this.setUserAgentForTab(message.tabId || sender.tab?.id, message.userAgent)
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;

            case 'resetUserAgent':
                this.resetUserAgentForTab(message.tabId || sender.tab?.id)
                    .then(() => sendResponse({ success: true }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;

            case 'getTabInfo':
                this.getTabInfo(message.tabId || sender.tab?.id)
                    .then(info => sendResponse({ success: true, data: info }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;

            case 'captureScreenshot':
                this.captureScreenshot(message.tabId || sender.tab?.id)
                    .then(dataUrl => sendResponse({ success: true, dataUrl }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                break;

            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }

    async setUserAgentForTab(tabId, userAgent) {
        if (!tabId) {
            throw new Error('Tab ID is required');
        }

        try {
            // Store user agent for this tab
            this.userAgentRules.set(tabId, userAgent);

            // Update declarativeNetRequest rules for user agent
            const rules = [{
                id: tabId,
                priority: 1,
                action: {
                    type: 'modifyHeaders',
                    requestHeaders: [{
                        header: 'User-Agent',
                        operation: 'set',
                        value: userAgent
                    }]
                },
                condition: {
                    tabIds: [tabId],
                    resourceTypes: ['main_frame', 'sub_frame']
                }
            }];

            // Remove existing rule for this tab
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [tabId],
                addRules: rules
            });

            console.log(`User agent set for tab ${tabId}:`, userAgent);

        } catch (error) {
            console.error('Failed to set user agent:', error);
            throw error;
        }
    }

    async resetUserAgentForTab(tabId) {
        if (!tabId) {
            throw new Error('Tab ID is required');
        }

        try {
            // Remove user agent rule for this tab
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [tabId]
            });

            // Remove from our tracking
            this.userAgentRules.delete(tabId);

            console.log(`User agent reset for tab ${tabId}`);

        } catch (error) {
            console.error('Failed to reset user agent:', error);
            throw error;
        }
    }

    async getTabInfo(tabId) {
        if (!tabId) {
            throw new Error('Tab ID is required');
        }

        try {
            const tab = await chrome.tabs.get(tabId);
            const window = await chrome.windows.get(tab.windowId);

            return {
                tab: {
                    id: tab.id,
                    url: tab.url,
                    title: tab.title,
                    width: tab.width,
                    height: tab.height
                },
                window: {
                    id: window.id,
                    width: window.width,
                    height: window.height,
                    state: window.state
                },
                userAgent: this.userAgentRules.get(tabId) || null
            };

        } catch (error) {
            console.error('Failed to get tab info:', error);
            throw error;
        }
    }

    async captureScreenshot(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png',
                quality: 100
            });

            return dataUrl;

        } catch (error) {
            console.error('Failed to capture screenshot:', error);
            throw error;
        }
    }

    onTabComplete(tabId, tab) {
        // Clean up user agent rules for tabs that are navigating
        if (this.userAgentRules.has(tabId)) {
            console.log(`Tab ${tabId} completed loading with custom user agent`);
        }
    }

    onWindowCreated(window) {
        console.log('New window created:', window.id);
    }

    // Utility method to get all active simulations
    getActiveSimulations() {
        return Array.from(this.userAgentRules.entries()).map(([tabId, userAgent]) => ({
            tabId,
            userAgent
        }));
    }

    // Clean up rules for closed tabs
    async cleanupClosedTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            const activeTabs = new Set(tabs.map(tab => tab.id));
            
            // Remove rules for tabs that no longer exist
            const rulesToRemove = [];
            for (const tabId of this.userAgentRules.keys()) {
                if (!activeTabs.has(tabId)) {
                    rulesToRemove.push(tabId);
                    this.userAgentRules.delete(tabId);
                }
            }

            if (rulesToRemove.length > 0) {
                await chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: rulesToRemove
                });
                console.log('Cleaned up rules for closed tabs:', rulesToRemove);
            }

        } catch (error) {
            console.error('Failed to cleanup closed tabs:', error);
        }
    }
}

// Initialize background service worker
const aspectaBackground = new AspectaBackground();

// Periodic cleanup of closed tabs
setInterval(() => {
    aspectaBackground.cleanupClosedTabs();
}, 60000); // Clean up every minute
