/**
 * Utility functions for Steve's Chat Playground
 */

// Simple encryption/decryption for API keys
const encrypt = (text) => {
    // This is a very basic encryption for demonstration purposes
    // In a production environment, use a more secure encryption method
    return btoa(text);
};

const decrypt = (encryptedText) => {
    // Decrypt the encrypted text
    return atob(encryptedText);
};

// Save API key to localStorage
const saveApiKey = (key, value) => {
    try {
        const encryptedValue = encrypt(value);
        localStorage.setItem(key, encryptedValue);
        return true;
    } catch (error) {
        console.error('Error saving API key:', error);
        return false;
    }
};

// Get API key from localStorage
const getApiKey = (key) => {
    try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        return decrypt(encryptedValue);
    } catch (error) {
        console.error('Error getting API key:', error);
        return null;
    }
};

// Add feedback controls to messages
function addFeedbackControls(messageElement, isLatest) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback' + (isLatest ? ' visible' : '');
    
    const thumbsUp = document.createElement('span');
    thumbsUp.innerHTML = '👍';
    thumbsUp.className = 'feedback-button thumbs-up';
    thumbsUp.title = 'Helpful';
    
    const thumbsDown = document.createElement('span');
    thumbsDown.innerHTML = '👎';
    thumbsDown.className = 'feedback-button thumbs-down';
    thumbsDown.title = 'Not helpful';
    
    feedbackDiv.appendChild(thumbsUp);
    feedbackDiv.appendChild(thumbsDown);
    messageElement.appendChild(feedbackDiv);
}

// Create a message element
function createMessageElement(text, isUser) {
    const messageElement = document.createElement('div');
    messageElement.className = isUser ? 'user-message' : 'bot-message';
    messageElement.textContent = text;
    
    // Only add feedback controls to bot messages
    if (!isUser) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'message-feedback';
        
        const thumbsUp = document.createElement('span');
        thumbsUp.innerHTML = '👍';
        thumbsUp.className = 'feedback-button thumbs-up';
        thumbsUp.title = 'Helpful';
        
        const thumbsDown = document.createElement('span');
        thumbsDown.innerHTML = '👎';
        thumbsDown.className = 'feedback-button thumbs-down';
        thumbsDown.title = 'Not helpful';
        
        feedbackDiv.appendChild(thumbsUp);
        feedbackDiv.appendChild(thumbsDown);
        messageElement.appendChild(feedbackDiv);
    }
    
    return messageElement;
}

// Add a message to the chat
function addMessageToChat(text, isUser) {
    const chatWindow = document.getElementById('chat-window');
    
    // Hide feedback controls on all bot messages first
    const botMessages = chatWindow.getElementsByClassName('bot-message');
    Array.from(botMessages).forEach(msg => {
        const feedbackDiv = msg.querySelector('.message-feedback');
        if (feedbackDiv) {
            feedbackDiv.classList.remove('visible');
        }
    });
    
    const messageElement = createMessageElement(text, isUser);
    chatWindow.appendChild(messageElement);
    
    // If this is a bot message, make its feedback controls visible
    if (!isUser) {
        const feedbackDiv = messageElement.querySelector('.message-feedback');
        if (feedbackDiv) {
            feedbackDiv.classList.add('visible');
        }
    }
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show/hide working indicator
const toggleWorkingIndicator = (show) => {
    const indicator = document.querySelector('.working-indicator');
    if (show) {
        if (!indicator) {
            const newIndicator = document.createElement('div');
            newIndicator.classList.add('working-indicator', 'active');
            newIndicator.textContent = 'Working...';
            document.getElementById('chat-window').appendChild(newIndicator);
        } else {
            indicator.classList.add('active');
        }
    } else {
        if (indicator) {
            indicator.classList.remove('active');
        }
    }
};

// Change visual style
const changeStyle = (styleName) => {
    // Disable all style sheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        link.disabled = true;
    });
    
    // Enable the selected style sheet
    const styleSheet = document.getElementById('style-sheet');
    if (styleName === 'vanilla') {
        styleSheet.href = 'styles/vanilla.css';
    } else if (styleName === 'green-screen') {
        styleSheet.href = 'styles/green-screen.css';
    } else if (styleName === 'imessage') {
        styleSheet.href = 'styles/imessage.css';
    }
    styleSheet.disabled = false;
};

// Load properties from a file
const loadProperties = (filePath) => {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', filePath, false); // false makes the request synchronous
        xhr.send();
        
        if (xhr.status !== 200) {
            throw new Error(`HTTP error! status: ${xhr.status}`);
        }
        
        const text = xhr.responseText;
        
        const properties = {};
        const lines = text.split('\n');
        
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const [key, value] = line.split('=').map(part => part.trim());
                if (key && value) {
                    properties[key] = value;
                }
            }
        }
        
        return properties;
    } catch (error) {
        console.error('Error loading properties:', error);
        return {};
    }
};

// Export utility functions
window.ChatUtils = {
    encrypt,
    decrypt,
    saveApiKey,
    getApiKey,
    createMessageElement,
    addMessageToChat,
    toggleWorkingIndicator,
    changeStyle,
    loadProperties
}; 