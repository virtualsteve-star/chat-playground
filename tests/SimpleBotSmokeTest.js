class SimpleBotSmokeTest {
    constructor() {
        this.prompts = [];
        this.currentIndex = 0;
        this.isRunning = false;
    }

    async loadPrompts() {
        try {
            const response = await fetch('tests/data/testprompts.txt');
            const text = await response.text();
            this.prompts = text.split('\n').filter(line => line.trim());
            console.log(`Loaded ${this.prompts.length} test prompts`);
        } catch (error) {
            console.error('Failed to load test prompts:', error);
        }
    }

    async startTest() {
        if (this.isRunning) return;
        
        await this.loadPrompts();
        this.isRunning = true;
        this.currentIndex = 0;
        
        // Set Oscar personality and local filters
        // See below for how to set these programmatically
        this.setOscarPersonality();
        this.enableLocalFilters();
        
        this.processNextPrompt();
    }

    setOscarPersonality() {
        const selector = document.getElementById('personality-selector');
        if (!selector) return;
        // Try to find the option that contains "Oscar" (case-insensitive)
        for (let i = 0; i < selector.options.length; i++) {
            if (selector.options[i].textContent.toLowerCase().includes('oscar')) {
                selector.selectedIndex = i;
                selector.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    enableLocalFilters() {
        // Input filters
        document.querySelectorAll('.input-filter-checkbox').forEach(cb => {
            if (!cb.value.startsWith('openai') && cb.value !== 'rate_limit') cb.checked = true;
            if (cb.value === 'rate_limit') cb.checked = false;
        });
        // Output filters
        document.querySelectorAll('.output-filter-checkbox').forEach(cb => {
            if (!cb.value.startsWith('openai') && cb.value !== 'code') cb.checked = true;
        });
        // Trigger change events to update selected filters
        document.querySelectorAll('.input-filter-checkbox, .output-filter-checkbox').forEach(cb => {
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    async processNextPrompt() {
        if (!this.isRunning || this.currentIndex >= this.prompts.length) {
            this.isRunning = false;
            console.log('Test run completed');
            // Add completion message to chat
            if (window.ChatUtils && window.ChatUtils.addMessageToChat) {
                window.ChatUtils.addMessageToChat('Testing complete', false);
            } else {
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow) {
                    const completionMessage = document.createElement('div');
                    completionMessage.className = 'message bot-message';
                    completionMessage.innerHTML = '<div class="message-content">Testing complete</div>';
                    chatWindow.appendChild(completionMessage);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            }
            return;
        }

        const prompt = this.prompts[this.currentIndex];
        console.log(`Processing prompt ${this.currentIndex + 1}/${this.prompts.length}: ${prompt}`);

        // Simulate typing and sending the prompt
        const chatInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        
        if (chatInput && sendButton) {
            chatInput.value = prompt;
            sendButton.click();
            // Wait for response (1 second for local filters)
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.currentIndex++;
            this.processNextPrompt();
        } else {
            console.error('Could not find chat input or send button');
            this.isRunning = false;
        }
    }

    stopTest() {
        this.isRunning = false;
    }
}

// Export the SimpleBotSmokeTest
window.SimpleBotSmokeTest = SimpleBotSmokeTest; 