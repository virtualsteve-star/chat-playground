/**
 * Storage Strategy Interface and Implementations
 * Defines how API keys are stored and retrieved
 */

class StorageStrategy {
    constructor(name) {
        if (this.constructor === StorageStrategy) {
            throw new Error('StorageStrategy is an abstract class');
        }
        this.name = name;
    }

    load(id) {
        throw new Error('load() must be implemented');
    }

    save(id, value) {
        throw new Error('save() must be implemented');
    }

    clear(id) {
        throw new Error('clear() must be implemented');
    }
}

class LocalStorageStrategy extends StorageStrategy {
    constructor() {
        super('localStorage');
    }

    load(id) {
        try {
            const key = `apiKey:${id}`;
            const value = localStorage.getItem(key);
            return value ? atob(value) : null; // Decode from base64
        } catch (error) {
            console.error('Error loading key from localStorage:', error);
            return null;
        }
    }

    save(id, value) {
        try {
            const key = `apiKey:${id}`;
            const encodedValue = btoa(value); // Encode to base64
            localStorage.setItem(key, encodedValue);
        } catch (error) {
            console.error('Error saving key to localStorage:', error);
            throw new Error('Failed to save API key');
        }
    }

    clear(id) {
        try {
            const key = `apiKey:${id}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error clearing key from localStorage:', error);
            throw new Error('Failed to clear API key');
        }
    }
}

// Export the classes
window.StorageStrategy = StorageStrategy;
window.LocalStorageStrategy = LocalStorageStrategy; 