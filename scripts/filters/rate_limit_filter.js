/**
 * Rate Limit Filter
 * Blocks user if more than 10 prompts are sent in the last 60 seconds
 */

class RateLimitFilter {
    constructor() {
        this.maxPrompts = 10;
        this.windowMs = 60 * 1000; // 60 seconds
        this.promptTimestamps = [];
        this.initialized = true;
    }

    async initialize() {
        this.initialized = true;
    }

    /**
     * Check if the user is rate limited
     * @returns {Object} Result containing blocked status and wait time (if blocked)
     */
    checkMessage() {
        if (!this.initialized) {
            throw new Error('Rate limit filter not initialized');
        }
        const now = Date.now();
        // Remove timestamps older than windowMs
        this.promptTimestamps = this.promptTimestamps.filter(ts => now - ts < this.windowMs);
        if (this.promptTimestamps.length >= this.maxPrompts) {
            const earliest = this.promptTimestamps[0];
            const waitMs = this.windowMs - (now - earliest);
            return {
                blocked: true,
                waitSeconds: Math.ceil(waitMs / 1000),
                promptsInWindow: this.promptTimestamps.length
            };
        }
        // Add this prompt's timestamp
        this.promptTimestamps.push(now);
        return { blocked: false };
    }

    /**
     * Get a user-friendly rejection message
     * @param {Object} blockedResult - The result from checkMessage
     * @returns {string} Human-readable rejection message
     */
    getRejectionMessage(blockedResult) {
        return `Rate limit exceeded: You may send up to ${this.maxPrompts} prompts per minute.\n` +
               `Please wait ${blockedResult.waitSeconds} seconds before sending another message.`;
    }

    /**
     * Check a message with selected filters
     * @param {string} message - The message to check (not used, but for interface consistency)
     * @param {string[]} selectedFilters - Array of selected filter names
     * @returns {Object} Result containing blocked status and wait time
     */
    checkMessageWithSelection(message, selectedFilters) {
        if (!this.initialized) {
            throw new Error('Rate limit filter not initialized');
        }
        if (!selectedFilters || !selectedFilters.includes('rate_limit')) {
            return { blocked: false };
        }
        return this.checkMessage();
    }

    /**
     * Set a custom rate limit
     * @param {number} maxPrompts - Max prompts per window
     * @param {number} windowMs - Window size in milliseconds
     */
    setRateLimit(maxPrompts, windowMs) {
        if (maxPrompts > 0 && windowMs > 0) {
            this.maxPrompts = maxPrompts;
            this.windowMs = windowMs;
        } else {
            throw new Error('Invalid rate limit parameters');
        }
    }
}

// Export the filter
window.RateLimitFilter = RateLimitFilter; 