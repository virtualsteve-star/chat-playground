/**
 * Input Length Filter
 * Simple filter that blocks messages exceeding 1024 characters
 */

class InputLengthFilter {
    constructor() {
        this.maxLength = 256;
        this.initialized = true;
    }

    /**
     * Initialize the filter
     * Note: This is a no-op in the current implementation but maintained for consistency
     */
    async initialize() {
        this.initialized = true;
    }

    /**
     * Check if a message exceeds the maximum length
     * @param {string} message - The message to check
     * @returns {Object} Result containing blocked status and length info
     */
    checkMessage(message) {
        if (!this.initialized) {
            throw new Error('Input length filter not initialized');
        }

        const length = message.length;
        return {
            blocked: length > this.maxLength,
            length: length,
            maxLength: this.maxLength
        };
    }

    /**
     * Get a user-friendly rejection message
     * @param {Object} blockedResult - The result from checkMessage
     * @returns {string} Human-readable rejection message
     */
    getRejectionMessage(blockedResult) {
        return `I'm sorry, but your message is too long (${blockedResult.length} characters). ` +
               `The maximum allowed length is ${blockedResult.maxLength} characters.`;
    }

    /**
     * Check a message with selected filters
     * @param {string} message - The message to check
     * @param {string[]} selectedFilters - Array of selected filter names
     * @returns {Object} Result containing blocked status and length info
     */
    checkMessageWithSelection(message, selectedFilters) {
        if (!this.initialized) {
            throw new Error('Input length filter not initialized');
        }
        if (!selectedFilters || !selectedFilters.includes('input_length')) {
            return { blocked: false };
        }
        return this.checkMessage(message);
    }

    /**
     * Set a custom maximum length
     * @param {number} maxLength - New maximum length
     */
    setMaxLength(maxLength) {
        if (maxLength > 0) {
            this.maxLength = maxLength;
        } else {
            throw new Error('Maximum length must be greater than 0');
        }
    }
}

// Export the filter
window.InputLengthFilter = InputLengthFilter; 