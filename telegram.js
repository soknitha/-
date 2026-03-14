/**
 * Telegram WebApp Integration
 * Handle Telegram Mini App API
 */

const tg = window.Telegram.WebApp;

// Initialize Telegram WebApp
function initTelegram() {
    // Expand app to full height
    tg.expand();
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Set header color
    tg.setHeaderColor('#0088cc');
    
    // Apply theme
    applyTelegramTheme();
    
    // Setup main button (if needed)
    setupMainButton();
    
    console.log('Telegram WebApp initialized');
    console.log('User:', tg.initDataUnsafe.user);
    console.log('Theme:', tg.colorScheme);
}

// Apply Telegram theme
function applyTelegramTheme() {
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Listen for theme changes
    tg.onEvent('themeChanged', () => {
        if (tg.colorScheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}

// Setup Telegram Main Button
function setupMainButton() {
    tg.MainButton.text = 'Close';
    tg.MainButton.hide();
    
    tg.MainButton.onClick(() => {
        tg.close();
    });
}

// Show main button
function showMainButton(text, callback) {
    tg.MainButton.text = text;
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
}

// Hide main button
function hideMainButton() {
    tg.MainButton.hide();
    tg.MainButton.offClick();
}

// Get user data
function getUserData() {
    const user = tg.initDataUnsafe.user;
    
    if (!user) {
        return {
            id: 0,
            first_name: 'Guest',
            username: 'guest'
        };
    }
    
    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || '',
        username: user.username || '',
        language_code: user.language_code || 'en',
        is_premium: user.is_premium || false
    };
}

// Show alert
function showTelegramAlert(message) {
    tg.showAlert(message);
}

// Show confirm
function showTelegramConfirm(message, callback) {
    tg.showConfirm(message, callback);
}

// Show popup
function showTelegramPopup(params) {
    tg.showPopup(params);
}

// Trigger haptic feedback
function hapticFeedback(type = 'medium') {
    if (tg.HapticFeedback) {
        switch (type) {
            case 'light':
                tg.HapticFeedback.impactOccurred('light');
                break;
            case 'medium':
                tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'heavy':
                tg.HapticFeedback.impactOccurred('heavy');
                break;
            case 'success':
                tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'warning':
                tg.HapticFeedback.notificationOccurred('warning');
                break;
            case 'error':
                tg.HapticFeedback.notificationOccurred('error');
                break;
        }
    }
}

// Open link
function openTelegramLink(url) {
    tg.openLink(url);
}

// Open invoice (for payments)
function openInvoice(url, callback) {
    tg.openInvoice(url, (status) => {
        if (status === 'paid') {
            callback(true);
        } else {
            callback(false);
        }
    });
}

// Send data back to bot
function sendDataToBot(data) {
    tg.sendData(JSON.stringify(data));
}

// Close app
function closeApp() {
    tg.close();
}

// Check if running in Telegram
function isTelegramWebApp() {
    return !!window.Telegram && !!window.Telegram.WebApp;
}

// Get init data (for backend authentication)
function getInitData() {
    return tg.initData;
}

// Export functions
window.TelegramApp = {
    init: initTelegram,
    getUserData,
    showAlert: showTelegramAlert,
    showConfirm: showTelegramConfirm,
    showPopup: showTelegramPopup,
    haptic: hapticFeedback,
    openLink: openTelegramLink,
    openInvoice,
    sendData: sendDataToBot,
    close: closeApp,
    isWebApp: isTelegramWebApp,
    getInitData,
    showMainButton,
    hideMainButton
};
