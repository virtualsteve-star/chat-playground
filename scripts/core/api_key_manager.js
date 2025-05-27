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

            // Check if a persistent key exists in localStorage
            let strategy;
            try {
                const keyName = `apiKey:${descriptor.id}`;
                const value = localStorage.getItem(keyName);
                if (value) {
                    strategy = new LocalStorageStrategy();
                } else {
                    strategy = new InMemoryStrategy();
                }
            } catch (e) {
                strategy = new InMemoryStrategy();
            }
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
        return new Promise(async (resolve, reject) => {
            const value = window.prompt(`Please enter your ${key.getLabel()} API key:`);
            if (value && value.trim()) {
                try {
                    // Validate the key if it's OpenAI
                    if (key.getProvider() === 'openai') {
                        const isValid = await this.validateOpenAIKey(value.trim());
                        if (!isValid) {
                            alert('Invalid API key. Please check and try again.');
                            reject(new Error('Invalid API key.'));
                            return;
                        }
                    }
                    key.set(value.trim());
                    this.notify('keyChanged', key.getId());
                    resolve(key);
                } catch (error) {
                    alert('Error setting API key: ' + error.message);
                    reject(error);
                }
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

    hasKey(id) {
        try {
            const key = this.get(id);
            return key && key.isSet();
        } catch (e) {
            return false;
        }
    }
}

// Create and export the singleton instance
window.apiKeyManager = new APIKeyManager(); 