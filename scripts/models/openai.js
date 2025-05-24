/**
 * OpenAI Model Implementation
 * Connects to OpenAI's API for chat completions
 */

// --- OpenAI API Key Utilities ---
function sanitizeOpenAIKey(key) {
    if (!key) return '';
    // Remove all whitespace, newlines, and trim
    return key.replace(/\s+/g, '').trim();
}

function validateOpenAIKeyFormat(key) {
    // Must start with sk- and be a reasonable length (48+ chars)
    return typeof key === 'string' && key.startsWith('sk-') && key.length >= 48 && key.length < 200;
}

async function testOpenAIKey(key) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });
        if (response.status === 401) return false; // Unauthorized
        if (!response.ok) return false;
        return true;
    } catch (e) {
        return false;
    }
}
// --- End OpenAI API Key Utilities ---

class OpenAIModel {
    constructor() {
        this.apiKey = null;
        this.model = 'gpt-4o-mini';  // Restoring original model name
        this.systemPrompt = '';
        this.initialized = false;
        this.controller = null;
    }

    async initialize(systemPromptPath, apiKey = null) {
        try {
            // Require the key to be passed explicitly
            this.apiKey = apiKey;
            if (!this.apiKey) {
                this.initialized = false;
                throw new Error('API key is required');
            }
            // Load system prompt with cache-busting
            const cacheBustedPath = systemPromptPath + (systemPromptPath.includes('?') ? '&' : '?') + 'v=' + Date.now();
            const response = await fetch(cacheBustedPath);
            if (!response.ok) {
                this.initialized = false;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.systemPrompt = await response.text();
            this.initialized = true;
            return true;
        } catch (error) {
            this.initialized = false;
            console.error('Error initializing OpenAI model:', error);
            return false;
        }
    }

    async generateResponse(userMessage, context = {}) {
        if (!this.initialized) {
            console.error('[OpenAIModel] Not initialized');
            return "OpenAI model is not properly initialized. Please load a system prompt first.";
        }
        // If the key is missing or invalid, throw an error
        if (!this.apiKey || typeof this.apiKey !== 'string' || !this.apiKey.trim()) {
            console.error('[OpenAIModel] API key is not set or is invalid');
            return "OpenAI API key is not set or is invalid. Please provide your API key.";
        }

        // Create a new AbortController for this request
        this.controller = new AbortController();
        const signal = this.controller.signal;

        try {
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...((context.messages || []).slice(-10)),
                { role: 'user', content: userMessage }
            ];

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            };

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: true,
                    temperature: 0.7,
                    max_tokens: 1000 // Increased max tokens
                }),
                signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
            }

            // Create a ReadableStream from the response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // Return a stream-like interface
            return {
                [Symbol.asyncIterator]() {
                    return {
                        async next() {
                            try {
                                const { done, value } = await reader.read();
                                
                                if (done) {
                                    return { done: true };
                                }
                                
                                // Decode the chunk and add to buffer
                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                
                                // Keep the last potentially incomplete line in the buffer
                                buffer = lines.pop() || '';
                                
                                let text = '';
                                
                                for (const line of lines) {
                                    const trimmedLine = line.trim();
                                    if (trimmedLine === '') continue;
                                    if (trimmedLine === 'data: [DONE]') return { done: true };
                                    
                                    if (trimmedLine.startsWith('data: ')) {
                                        try {
                                            const jsonStr = trimmedLine.slice(6);
                                            const data = JSON.parse(jsonStr);
                                            
                                            // Check if this is a completion signal
                                            if (data.choices && data.choices[0] && data.choices[0].finish_reason) {
                                                // If we've reached the end, return any text accumulated and 
                                                // let the next call close the stream
                                                return text ? { value: text, done: false } : { done: true };
                                            }
                                            
                                            // Extract content from the delta
                                            const content = data.choices?.[0]?.delta?.content || '';
                                            if (content) {
                                                text += content;
                                            }
                                        } catch (e) {
                                            console.error('Error parsing chunk:', e, trimmedLine);
                                            continue;
                                        }
                                    }
                                }
                                
                                return text ? { value: text, done: false } : this.next();
                            } catch (error) {
                                if (error.name === 'AbortError') {
                                    return { done: true };
                                }
                                throw error;
                            }
                        }
                    };
                }
            };
        } catch (error) {
            throw error;
        }
    }

    cancel() {
        if (this.controller) {
            this.controller.abort();
            return true;
        }
        return false;
    }
}

// Create and export the OpenAI model instance
window.OpenAIModel = OpenAIModel; 