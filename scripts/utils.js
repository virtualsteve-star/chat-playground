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

// Create message elements (bubble and optional feedback controls)
function createMessageElement(text, isUser) {
    const messageBubble = document.createElement('div');
    messageBubble.className = isUser ? 'user-message' : 'bot-message';
    
    // Process text to properly handle line breaks
    // First escape HTML to prevent XSS, then convert newlines to <br>
    const processedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    
    messageBubble.innerHTML = processedText;

    let feedbackContainer = null;

    // Only create feedback controls for bot messages
    if (!isUser) {
        feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'message-feedback';

        // Thumbs Up
        const btnThumbsUp = document.createElement('button');
        btnThumbsUp.type = 'button'; // Good practice for buttons
        btnThumbsUp.className = 'feedback-button thumbs-up-button';
        btnThumbsUp.title = 'Like Response';
        const imgThumbsUp = document.createElement('img');
        imgThumbsUp.src = 'assets/graphics/thumbs-up.png';
        imgThumbsUp.alt = 'Helpful';
        imgThumbsUp.className = 'feedback-icon thumbs-up-icon';
        btnThumbsUp.appendChild(imgThumbsUp); // Icon inside button

        // Thumbs Down
        const btnThumbsDown = document.createElement('button');
        btnThumbsDown.type = 'button';
        btnThumbsDown.className = 'feedback-button thumbs-down-button';
        btnThumbsDown.title = 'Dislike Response';
        const imgThumbsDown = document.createElement('img');
        imgThumbsDown.src = 'assets/graphics/thumbs-down.png';
        imgThumbsDown.alt = 'Not helpful';
        imgThumbsDown.className = 'feedback-icon thumbs-down-icon';
        btnThumbsDown.appendChild(imgThumbsDown); // Icon inside button

        feedbackContainer.appendChild(btnThumbsUp); // Add button to container
        feedbackContainer.appendChild(btnThumbsDown); // Add button to container
    }

    // Return an object containing the elements
    return { bubble: messageBubble, feedback: feedbackContainer };
}

// Add a message to the chat
function addMessageToChat(text, isUser) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) {
        console.error("Chat window not found!");
        return;
    }

    // Hide feedback controls on all previous bot message entries first
    const messageEntries = chatWindow.getElementsByClassName('message-entry bot-entry');
    Array.from(messageEntries).forEach(entry => {
        const feedbackDiv = entry.querySelector('.message-feedback');
        if (feedbackDiv) {
            feedbackDiv.classList.remove('visible');
        }
    });

    // Create the elements for this message
    const elements = createMessageElement(text, isUser);

    // Create a wrapper div for the whole entry
    const messageEntry = document.createElement('div');
    messageEntry.className = `message-entry ${isUser ? 'user-entry' : 'bot-entry'}`;

    // Add the message bubble
    messageEntry.appendChild(elements.bubble);

    // Add the feedback controls div if it exists (for bot messages)
    if (elements.feedback) {
        messageEntry.appendChild(elements.feedback);
        // Make the feedback for this new bot message visible
        elements.feedback.classList.add('visible');
    }

    // Add the complete entry to the chat window
    chatWindow.appendChild(messageEntry);

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
    // Disable ALL linked stylesheets first
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        link.disabled = true;
    });

    // Remove dark mode class by default
    document.body.classList.remove('dark-mode');

    // Enable the correct stylesheet(s) based on the selection
    if (styleName === 'vanilla') {
        document.querySelector('link[href*="vanilla.css"]').disabled = false;
    } else if (styleName === 'green-screen') {
        document.querySelector('link[href*="green-screen.css"]').disabled = false;
    } else if (styleName === 'imessage') {
        // Enable only the base iMessage stylesheet
        document.querySelector('link[href*="imessage.css"]').disabled = false;
    } else if (styleName === 'imessage-dark') {
        // Enable the base iMessage stylesheet
        document.querySelector('link[href*="imessage.css"]').disabled = false;
        // ALSO enable the dark mode override stylesheet
        document.querySelector('link[href*="imessage-dark.css"]').disabled = false;
        // Add the dark mode class to activate the overrides
        document.body.classList.add('dark-mode');
    }
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