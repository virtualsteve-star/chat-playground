/**
 * APIKeyManager Singleton
 * Central manager for all API keys in the application
 */

class APIKeyManager {
    constructor() {
        if (APIKeyManager.instance) {
            return APIKeyManager.instance;
        }
        APIKeyManager.instance = this;

        this.registry = new Map();
        this.eventHandlers = {
            keyChanged: new Set(),
            strategyChanged: new Set(),
            keyCleared: new Set()
        };
    }

    register(descriptors) {
        if (!Array.isArray(descriptors)) {
            descriptors = [descriptors];
        }

        for (const descriptor of descriptors) {
            if (this.registry.has(descriptor.id)) {
                throw new Error(`API key with id ${descriptor.id} already registered`);
            }

            const strategy = new LocalStorageStrategy(); // Start with LocalStorageStrategy
            const key = new APIKey(descriptor, strategy);
            this.registry.set(descriptor.id, key);
        }
    }

    get(id) {
        const key = this.registry.get(id);
        if (!key) {
            throw new Error(`No API key registered with id ${id}`);
        }
        return key;
    }

    async require(id) {
        const key = this.get(id);
        if (!key.isSet()) {
            await this.promptForKey(key);
        }
        return key;
    }

    clear(id) {
        const key = this.get(id);
        key.clear();
        this.notify('keyCleared', id);
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            throw new Error(`Unknown event: ${event}`);
        }
        this.eventHandlers[event].add(handler);
    }

    off(event, handler) {
        if (!this.eventHandlers[event]) {
            throw new Error(`Unknown event: ${event}`);
        }
        this.eventHandlers[event].delete(handler);
    }

    notify(event, id) {
        if (!this.eventHandlers[event]) {
            throw new Error(`Unknown event: ${event}`);
        }
        for (const handler of this.eventHandlers[event]) {
            handler(id);
        }
    }

    async promptForKey(key) {
        return new Promise((resolve, reject) => {
            const value = prompt(`Please enter your ${key.getLabel()} API key:`);
            if (value && value.trim()) {
                // Optionally validate here
                key.set(value.trim());
                this.notify('keyChanged', key.getId());
                resolve(key);
            } else {
                reject(new Error('API key entry cancelled'));
            }
        });
    }

    async validateOpenAIKey(key) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${key}`
                }
            });
            return response.status === 200;
        } catch (error) {
            console.error('Error validating OpenAI key:', error);
            return false;
        }
    }
}

// Create and export the singleton instance
window.apiKeyManager = new APIKeyManager(); 