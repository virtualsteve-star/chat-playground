/**
 * Utility functions for Steve's Chat Playground
 */

// Create message elements (bubble and optional feedback controls)
function createMessageElement(text, isUser, isRejection = false) {
    const messageBubble = document.createElement('div');
    messageBubble.className = isUser ? 'user-message' : (isRejection ? 'rejection-message' : 'bot-message');

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
        imgThumbsUp.src = 'assets/graphics/thumbs-up.webp';
        imgThumbsUp.alt = 'Helpful';
        imgThumbsUp.className = 'feedback-icon thumbs-up-icon';
        btnThumbsUp.appendChild(imgThumbsUp); // Icon inside button

        // Thumbs Down
        const btnThumbsDown = document.createElement('button');
        btnThumbsDown.type = 'button';
        btnThumbsDown.className = 'feedback-button thumbs-down-button';
        btnThumbsDown.title = 'Dislike Response';
        const imgThumbsDown = document.createElement('img');
        imgThumbsDown.src = 'assets/graphics/thumbs-down.webp';
        imgThumbsDown.alt = 'Not helpful';
        imgThumbsDown.className = 'feedback-icon thumbs-down-icon';
        btnThumbsDown.appendChild(imgThumbsDown); // Icon inside button

        // Copy button
        const btnCopy = document.createElement('button');
        btnCopy.type = 'button'; // Good practice for buttons
        btnCopy.className = 'feedback-button copy-button';
        btnCopy.title = 'Copy Response';
        const imgCopy = document.createElement('img');
        imgCopy.src = 'assets/graphics/copy.webp';
        imgCopy.alt = 'Copy Response';
        imgCopy.className = 'feedback-icon copy-icon';
        btnCopy.appendChild(imgCopy); // Icon inside button

        // Add copy-to-clipboard functionality
        btnCopy.onclick = function () {
            const text = feedbackContainer.parentElement.querySelector('.bot-message').innerText;
            imgCopy.src = 'assets/graphics/reload.webp'; // Change icon to indicate copying
            navigator.clipboard.writeText(text).then(() => {
                setTimeout(() => {
                    imgCopy.src = 'assets/graphics/copy.webp';
                }, 300);
            });
        };

        feedbackContainer.appendChild(btnThumbsUp); // Add button to container
        feedbackContainer.appendChild(btnThumbsDown); // Add button to container
        feedbackContainer.appendChild(btnCopy); // Add copy button to container
    }

    // Return an object containing the elements
    return { bubble: messageBubble, feedback: feedbackContainer };
}

// Add a message to the chat
function addMessageToChat(text, isUser, isRejection = false) {
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
    const elements = createMessageElement(text, isUser, isRejection);

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
    // Remove all theme classes
    document.body.classList.remove('imessage', 'imessage-dark', 'dark-mode', 'green-screen');
    
    // Add appropriate theme class
    if (styleName === 'imessage') {
        document.body.classList.add('imessage');
    } else if (styleName === 'imessage-dark') {
        document.body.classList.add('imessage', 'dark-mode');
    } else if (styleName === 'green-screen') {
        document.body.classList.add('green-screen');
    }
    // vanilla theme needs no additional classes
    
    // Store the current style in localStorage
    localStorage.setItem('selectedStyle', styleName);
};

// Load properties from a file
const loadProperties = (filePath) => {
    try {
        // Add cache-busting query string
        const cacheBustedPath = filePath + (filePath.includes('?') ? '&' : '?') + 'v=' + Date.now();
        const xhr = new XMLHttpRequest();
        xhr.open('GET', cacheBustedPath, false); // false makes the request synchronous
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
    createMessageElement,
    addMessageToChat,
    toggleWorkingIndicator,
    changeStyle,
    loadProperties
};

window.ChatUtils.addScanningBubble = function () {
    // Remove any existing scanning bubble first
    window.ChatUtils.removeScanningBubble();
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const bubble = document.createElement('div');
    bubble.className = 'message-entry bot-entry scanning-bubble';
    const bubbleInner = document.createElement('div');
    bubbleInner.className = 'message-bubble bot-bubble';
    bubbleInner.textContent = 'Scanning.';
    bubble.appendChild(bubbleInner);
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    // Animation
    let dots = 1;
    bubble._scanningInterval = setInterval(() => {
        dots = (dots % 3) + 1;
        bubbleInner.textContent = 'Scanning' + '.'.repeat(dots);
    }, 400);
};

window.ChatUtils.removeScanningBubble = function () {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const bubble = chatWindow.querySelector('.scanning-bubble');
    if (bubble) {
        if (bubble._scanningInterval) clearInterval(bubble._scanningInterval);
        bubble.remove();
    }
};

window.ChatUtils.addWorkingBubble = function () {
    window.ChatUtils.removeWorkingBubble();
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const bubble = document.createElement('div');
    bubble.className = 'message-entry bot-entry working-bubble';
    const bubbleInner = document.createElement('div');
    bubbleInner.className = 'message-bubble bot-bubble';
    bubbleInner.textContent = 'Working.';
    bubble.appendChild(bubbleInner);
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    let dots = 1;
    bubble._workingInterval = setInterval(() => {
        dots = (dots % 3) + 1;
        bubbleInner.textContent = 'Working' + '.'.repeat(dots);
    }, 400);
};

window.ChatUtils.removeWorkingBubble = function () {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const bubble = chatWindow.querySelector('.working-bubble');
    if (bubble) {
        if (bubble._workingInterval) clearInterval(bubble._workingInterval);
        bubble.remove();
    }
};

window.ChatUtils.addFilteringBubble = function () {
    window.ChatUtils.removeFilteringBubble();
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const bubble = document.createElement('div');
    bubble.className = 'message-entry bot-entry filtering-bubble';
    const bubbleInner = document.createElement('div');
    bubbleInner.className = 'message-bubble bot-bubble';
    bubbleInner.textContent = 'Filtering.';
    bubble.appendChild(bubbleInner);
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    let dots = 1;
    bubble._filteringInterval = setInterval(() => {
        dots = (dots % 3) + 1;
        bubbleInner.textContent = 'Filtering' + '.'.repeat(dots);
    }, 400);
};

window.ChatUtils.removeFilteringBubble = function () {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const bubble = chatWindow.querySelector('.filtering-bubble');
    if (bubble) {
        if (bubble._filteringInterval) clearInterval(bubble._filteringInterval);
        bubble.remove();
    }
}; 