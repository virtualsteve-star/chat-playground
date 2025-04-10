/**
 * OpenAI Model Implementation
 * Connects to OpenAI's API for chat completions
 */

class OpenAIModel {
    constructor() {
        this.apiKey = null;
        this.model = 'gpt-4o-mini';  // Restoring original model name
        this.systemPrompt = '';
        this.initialized = false;
        this.controller = null;
    }

    async initialize(systemPromptPath) {
        try {
            // Get API key from localStorage
            this.apiKey = window.ChatUtils.getApiKey('openai_api_key');
            
            if (!this.apiKey) {
                // Prompt user for API key
                const apiKey = prompt('Please enter your OpenAI API key:');
                if (apiKey) {
                    this.apiKey = apiKey;
                    window.ChatUtils.saveApiKey('openai_api_key', apiKey);
                } else {
                    throw new Error('API key is required');
                }
            }
            
            // Load system prompt
            const response = await fetch(systemPromptPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.systemPrompt = await response.text();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing OpenAI model:', error);
            return false;
        }
    }

    async generateResponse(userMessage, context = {}) {
        if (!this.initialized) {
            return "OpenAI model is not properly initialized. Please load a system prompt first.";
        }

        if (!this.apiKey) {
            return "OpenAI API key is not set. Please provide your API key.";
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

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
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