/**
 * GeminiModel Class
 * Represents a Gemini chat model
 */

class GeminiModel {
    constructor() {
        this.apiKey = null;
        this.model = 'gemini-2.5-flash'; // Default model
    }

    async initialize(resourcePath, apiKey) {
        this.apiKey = apiKey;
        // No specific initialization required for Gemini
        return Promise.resolve();
    }

    async generateResponse(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error.message}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error generating response from Gemini:', error);
            throw error;
        }
    }

    clearApiKey() {
        this.apiKey = null;
    }
}

// Export the class
window.GeminiModel = GeminiModel;