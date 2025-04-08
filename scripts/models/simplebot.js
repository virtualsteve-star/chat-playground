/**
 * SimpleBotModel - A simple, local chatbot model for no-cost testing
 * Based on pattern matching and templated responses
 */

class SimpleBotModel {
    constructor() {
        this.patterns = [];
        this.greetings = [];
        this.farewells = [];
        this.defaultResponses = [];
        this.helloMessage = '';
        this.memory = [];
        this.initialized = false;
    }

    async initialize(scriptPath) {
        try {
            const response = await fetch(scriptPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            this.script = this.parseScript(text);
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing SimpleBot:', error);
            return false;
        }
    }

    parseScript(scriptText) {
        const script = {
            greetings: [],
            farewells: [],
            patterns: []
        };

        const lines = scriptText.split('\n');
        let currentSection = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;

            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                currentSection = trimmedLine.slice(1, -1).toLowerCase();
                continue;
            }

            if (currentSection === 'greetings') {
                script.greetings.push(trimmedLine);
            } else if (currentSection === 'farewells') {
                script.farewells.push(trimmedLine);
            } else if (currentSection === 'patterns') {
                const [pattern, response] = trimmedLine.split('=>').map(part => part.trim());
                if (pattern && response) {
                    script.patterns.push({ pattern, response });
                }
            }
        }

        return script;
    }

    findPatternMatch(input) {
        const normalizedInput = input.toLowerCase();
        
        // Check for exact matches first
        for (const { pattern, response } of this.script.patterns) {
            if (normalizedInput.includes(pattern.toLowerCase())) {
                return this.processResponse(response, input);
            }
        }
        
        // If no match found, use a default response
        return this.getDefaultResponse();
    }

    processResponse(response, input) {
        // Replace variables in the response
        let processedResponse = response;
        
        // Replace {input} with the user's input
        processedResponse = processedResponse.replace(/{input}/g, input);
        
        // Replace {memory} with a random memory if available
        if (processedResponse.includes('{memory}') && this.memory.length > 0) {
            const randomMemory = this.memory[Math.floor(Math.random() * this.memory.length)];
            processedResponse = processedResponse.replace(/{memory}/g, randomMemory);
        }
        
        // Add the current input to memory
        this.memory.push(input);
        if (this.memory.length > 5) {
            this.memory.shift(); // Keep only the last 5 inputs
        }
        
        return processedResponse;
    }

    getDefaultResponse() {
        const defaultResponses = [
            "Please tell me more about that.",
            "How does that make you feel?",
            "Can you elaborate on that?",
            "I see. Please continue.",
            "That's interesting. Tell me more."
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    async generateResponse(userMessage, context = {}) {
        if (!this.initialized) {
            return "SimpleBot is not properly initialized. Please load a script first.";
        }

        // Check for greetings
        if (this.script.greetings.some(greeting => 
            userMessage.toLowerCase().includes(greeting.toLowerCase()))) {
            return this.script.greetings[Math.floor(Math.random() * this.script.greetings.length)];
        }

        // Check for farewells
        if (this.script.farewells.some(farewell => 
            userMessage.toLowerCase().includes(farewell.toLowerCase()))) {
            return this.script.farewells[Math.floor(Math.random() * this.script.farewells.length)];
        }

        // Find a pattern match
        return this.findPatternMatch(userMessage);
    }

    cancel() {
        // ELIZA doesn't need cancellation as it responds immediately
        return true;
    }
}

// Make the model available globally
window.SimpleBotModel = SimpleBotModel; 