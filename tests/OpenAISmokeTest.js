class OpenAISmokeTest extends SimpleBotSmokeTest {
    constructor() {
        super();
        this.waitingForResponse = false;
        this.messageObserver = null;
        this.lastMessageCount = 0;
        this.startTime = null;
    }

    async startTest() {
        if (this.isRunning) return;
        
        // Check for OpenAI API key before running the test
        if (!window.apiKeyManager || !window.apiKeyManager.hasKey('openai.chat')) {
            alert('A valid OpenAI API key is required to run the OpenAI Smoke Test. Please add your API key in Preferences.');
            return;
        }
        
        await this.loadPrompts();
        this.isRunning = true;
        this.currentIndex = 0;
        this.startTime = Date.now();
        
        // Set Bob personality and AI filters
        this.setBobPersonality();
        this.enableAIFilters();
        
        // Add message listener before starting
        this.addMessageListener();
        this.processNextPrompt();
    }

    setBobPersonality() {
        const selector = document.getElementById('personality-selector');
        if (!selector) return;
        // Try to find the option that contains "Bob" (case-insensitive)
        for (let i = 0; i < selector.options.length; i++) {
            if (selector.options[i].textContent.toLowerCase().includes('bob')) {
                selector.selectedIndex = i;
                selector.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    enableAIFilters() {
        // Input filters - enable only OpenAI ones
        document.querySelectorAll('.input-filter-checkbox').forEach(cb => {
            if (cb.value.startsWith('openai')) {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });
        // Output filters - enable only OpenAI ones
        document.querySelectorAll('.output-filter-checkbox').forEach(cb => {
            if (cb.value.startsWith('openai')) {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });
        // Trigger change events to update selected filters
        document.querySelectorAll('.input-filter-checkbox, .output-filter-checkbox').forEach(cb => {
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    addMessageListener() {
        // Listen for new bot messages
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) {
            console.error('Could not find chat window');
            return;
        }

        this.lastMessageCount = chatWindow.children.length;
        
        this.messageObserver = new MutationObserver((mutations) => {
            const currentMessageCount = chatWindow.children.length;
            
            // Check if we have a new message
            if (currentMessageCount > this.lastMessageCount) {
                const newMessage = chatWindow.lastElementChild;
                
                // Check for any type of response
                if (newMessage.classList) {
                    // Handle intermediate states
                    if (newMessage.textContent.includes('Working...') || 
                        newMessage.textContent.includes('Filtering...') ||
                        newMessage.classList.contains('scanning-bubble')) {
                        return;
                    }
                    
                    // Handle final bot response
                    if (newMessage.classList.contains('bot-entry') && 
                        !newMessage.classList.contains('working-bubble') && 
                        !newMessage.classList.contains('filtering-bubble') &&
                        !newMessage.classList.contains('scanning-bubble')) {
                        this.waitingForResponse = false;
                        this.lastMessageCount = currentMessageCount;
                        // Wait a bit before sending next prompt
                        setTimeout(() => this.processNextPrompt(), 1000);
                    }
                }
            }
        });

        this.messageObserver.observe(chatWindow, { 
            childList: true, 
            subtree: true,
            characterData: true,
            attributes: true
        });
    }

    async processNextPrompt() {
        if (!this.isRunning || this.currentIndex >= this.prompts.length) {
            this.isRunning = false;
            if (this.messageObserver) {
                this.messageObserver.disconnect();
            }
            
            // Calculate test duration and create summary
            const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
            const summary = `Testing complete - Processed ${this.prompts.length} prompts in ${duration} seconds`;
            
            // Add completion message to chat
            if (window.ChatUtils && window.ChatUtils.addMessageToChat) {
                window.ChatUtils.addMessageToChat(summary, false);
            } else {
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow) {
                    const completionMessage = document.createElement('div');
                    completionMessage.className = 'message bot-message';
                    completionMessage.innerHTML = `<div class="message-content">${summary}</div>`;
                    chatWindow.appendChild(completionMessage);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            }
            return;
        }

        if (this.waitingForResponse) {
            return; // Don't send next prompt until we get a response
        }

        const prompt = this.prompts[this.currentIndex];
        console.log(`Processing prompt ${this.currentIndex + 1}/${this.prompts.length}: ${prompt}`);
        
        const chatInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        
        if (chatInput && sendButton) {
            chatInput.value = prompt;
            sendButton.click();
            this.waitingForResponse = true;
            this.currentIndex++;
        } else {
            console.error('Could not find chat input or send button');
            this.isRunning = false;
        }
    }

    stopTest() {
        this.isRunning = false;
        this.waitingForResponse = false;
        if (this.messageObserver) {
            this.messageObserver.disconnect();
        }
    }
}

// Export the OpenAISmokeTest
window.OpenAISmokeTest = OpenAISmokeTest; 