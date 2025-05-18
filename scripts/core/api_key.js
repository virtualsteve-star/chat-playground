/**
 * APIKey Class
 * Represents a single API key with its metadata and storage strategy
 */

class APIKey {
    constructor(descriptor, strategy) {
        if (!descriptor || !descriptor.id || !descriptor.provider) {
            throw new Error('Invalid APIKey descriptor');
        }
        if (!strategy || !(strategy instanceof StorageStrategy)) {
            throw new Error('Invalid storage strategy');
        }

        this.id = descriptor.id;
        this.provider = descriptor.provider;
        this.label = descriptor.label || `${descriptor.provider} (${descriptor.id})`;
        this.strategy = strategy;
    }

    getId() {
        return this.id;
    }

    getProvider() {
        return this.provider;
    }

    getLabel() {
        return this.label;
    }

    isSet() {
        return this.get() !== null;
    }

    get() {
        return this.strategy.load(this.id);
    }

    set(value) {
        if (!value) {
            throw new Error('Cannot set empty API key');
        }
        this.strategy.save(this.id, value);
    }

    clear() {
        this.strategy.clear(this.id);
    }

    switchStrategy(newStrategy) {
        if (!newStrategy || !(newStrategy instanceof StorageStrategy)) {
            throw new Error('Invalid storage strategy');
        }
        
        // If we have a value, preserve it during strategy switch
        const currentValue = this.get();
        this.strategy = newStrategy;
        if (currentValue) {
            this.set(currentValue);
        }
    }
}

// Export the class
window.APIKey = APIKey; 