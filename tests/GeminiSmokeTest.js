class GeminiSmokeTest {
    constructor() {
        this.prompts = [];
        this.currentIndex = 0;
        this.isRunning = false;
        this.startTime = Date.now();
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
        
        this.setGeminiPersonality();
        
        this.processNextPrompt();
    }

    setGeminiPersonality() {
        const selector = document.getElementById('personality-selector');
        if (!selector) return;
        for (let i = 0; i < selector.options.length; i++) {
            if (selector.options[i].textContent.toLowerCase().includes('gemini')) {
                selector.selectedIndex = i;
                selector.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    async processNextPrompt() {
        if (!this.isRunning || this.currentIndex >= this.prompts.length) {
            this.isRunning = false;
            const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
            const summary = `Testing complete - Processed ${this.prompts.length} prompts in ${duration} seconds`;
            if (window.ChatUtils && window.ChatUtils.addMessageToChat) {
                window.ChatUtils.addMessageToChat(summary, false);
            } else {
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow) {
                    const completionMessage = document.createElement('div');
                    completionMessage.className = 'message bot-message';
                    completionMessage.innerHTML = `<div class=\"message-content\">${summary}</div>`;
                    chatWindow.appendChild(completionMessage);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            }
            return;
        }

        const prompt = this.prompts[this.currentIndex];
        console.log(`Processing prompt ${this.currentIndex + 1}/${this.prompts.length}: ${prompt}`);

        const chatInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        
        if (chatInput && sendButton) {
            chatInput.value = prompt;
            sendButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
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

window.GeminiSmokeTest = GeminiSmokeTest;