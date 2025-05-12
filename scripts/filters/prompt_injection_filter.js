/**
 * Prompt Injection Filter
 * Detects potential prompt injection attempts using heuristic rules
 * 
 * This filter uses a weighted scoring system to detect common prompt injection patterns.
 * Each rule has a weight (1-3) indicating its severity, and the final score is calculated
 * as a percentage of the maximum possible score.
 * 
 * The default threshold is 30% - messages scoring above this are considered injection attempts.
 * This can be adjusted using setThreshold().
 */

class PromptInjectionFilter {
    constructor() {
        // Initialize with a set of rules targeting common prompt injection patterns
        this.rules = [
            // Rule 1: Attempts to override or ignore previous instructions
            // Weight: 10 (Critical) - Direct attempt to subvert the system
            { 
                pattern: /\b(ignore|forget|disregard|override)\b.{0,40}\b(previous|prior)\b.{0,40}\b(instructions?|directives?)\b/i, 
                weight: 10,
                description: "Attempts to override or ignore previous instructions"
            },

            // Rule 2: Role manipulation attempts
            // Weight: 7 (High) - Common in DAN-style jailbreaks
            { 
                pattern: /\b(act|pretend|behave)\s+(as|like)\b.{0,40}\b(system|assistant|dan|jailbreak|unfiltered)\b/i, 
                weight: 7,
                description: "Attempts to manipulate the AI's role or behavior"
            },

            // Rule 3: Direct jailbreak attempts
            // Weight: 10 (Critical) - Explicit attempts to bypass restrictions
            { 
                pattern: /\b(do anything now|unfiltered mode|jailbreak|\bdan\b)\b/i, 
                weight: 10,
                description: "Direct attempts to bypass system restrictions"
            },

            // Rule 4: Role specification in JSON format
            // Weight: 5 (Medium) - Common in API-based injection attempts
            { 
                pattern: /\brole\s*:\s*(system|assistant|user)\b/i, 
                weight: 5,
                description: "Attempts to specify roles in JSON format"
            },

            // Rule 5: Chat speaker labels
            // Weight: 2 (Low) - Could be legitimate in some contexts
            { 
                pattern: /\b(system|assistant|user):/i, 
                weight: 2,
                description: "Use of chat speaker labels"
            },

            // Rule 6: Prompt leak attempts
            // Weight: 10 (Critical) - Attempts to expose system internals
            { 
                pattern: /\b(reveal|show|expose)\b.{0,40}\b(system prompt|hidden rules|internal instructions?)\b/i, 
                weight: 10,
                description: "Attempts to expose system prompts or internal rules"
            },

            // Rule 7: Verbatim repetition attempts
            // Weight: 5 (Medium) - Common in prompt extraction attempts
            { 
                pattern: /\b(repeat after me|verbatim|print exactly)\b/i, 
                weight: 5,
                description: "Attempts to force verbatim repetition"
            },

            // Rule 8: Time-based instruction overrides
            // Weight: 2 (Low) - Could be legitimate in some contexts
            { 
                pattern: /\b(from now on|until told otherwise|henceforth)\b/i, 
                weight: 2,
                description: "Attempts to set permanent instruction overrides"
            },

            // Rule 9: Requests for harmful content
            // Weight: 7 (High) - Attempts to generate dangerous content
            { 
                pattern: /\b(write|generate|explain)\b.{0,40}\b(illegal|dangerous|harmful)\b/i, 
                weight: 7,
                description: "Requests for harmful or dangerous content"
            }
        ];
        this.initialized = true;
        this.threshold = 30; // Default threshold of 30%
    }

    /**
     * Initialize the filter
     * Note: This is a no-op in the current implementation as rules are built-in
     * but maintained for consistency with other filters
     */
    async initialize() {
        this.initialized = true;
    }

    /**
     * Check a message for potential prompt injection attempts
     * @param {string} message - The message to check
     * @returns {Object} Result containing blocked status and score
     */
    checkMessage(message) {
        if (!this.initialized) {
            throw new Error('Prompt injection filter not initialized');
        }

        const { score, matchedRules } = this.calculateScoreWithMatches(message);
        return {
            blocked: score >= this.threshold,
            score: score,
            threshold: this.threshold,
            matchedRules
        };
    }

    calculateScoreWithMatches(message) {
        const normalizedMessage = message.normalize("NFKD").toLowerCase();
        const maxPossibleScore = this.rules.reduce((sum, rule) => sum + rule.weight, 0);
        let matchedRules = [];
        const actualScore = this.rules.reduce((sum, rule) => {
            if (rule.pattern.test(normalizedMessage)) {
                matchedRules.push(rule);
                return sum + rule.weight;
            }
            return sum;
        }, 0);
        return {
            score: Math.round((actualScore / maxPossibleScore) * 100),
            matchedRules
        };
    }

    /**
     * Get a user-friendly rejection message
     * @param {Object} blockedResult - The result from checkMessage
     * @returns {string} Human-readable rejection message
     */
    getRejectionMessage(blockedResult) {
        let reason = '';
        if (blockedResult.matchedRules && blockedResult.matchedRules.length > 0) {
            reason = blockedResult.matchedRules.map(r => `- ${r.description}`).join('\n');
        } else {
            reason = 'Heuristic rules detected a likely prompt injection pattern.';
        }
        return `I'm sorry, but I cannot process this request as it appears to contain a prompt injection attempt ` +
               `(detection score: ${blockedResult.score}%). This is to ensure the security and integrity of our system.\nReason:\n${reason}`;
    }

    /**
     * Check a message with selected filters
     * @param {string} message - The message to check
     * @param {string[]} selectedFilters - Array of selected filter names
     * @returns {Object} Result containing blocked status and score
     */
    checkMessageWithSelection(message, selectedFilters) {
        if (!this.initialized) {
            throw new Error('Prompt injection filter not initialized');
        }
        if (!selectedFilters || !selectedFilters.includes('prompt_injection')) {
            return { blocked: false };
        }
        return this.checkMessage(message);
    }

    /**
     * Add a custom rule to the filter
     * @param {string} pattern - Regular expression pattern (will be made case-insensitive)
     * @param {number} weight - Rule weight (1-3)
     * @param {string} description - Description of what the rule detects
     */
    addRule(pattern, weight, description) {
        if (weight < 1 || weight > 3) {
            throw new Error('Rule weight must be between 1 and 3');
        }
        this.rules.push({ 
            pattern: new RegExp(pattern, 'i'), 
            weight,
            description: description || 'Custom rule'
        });
    }

    /**
     * Set the detection threshold
     * @param {number} threshold - New threshold (0-100)
     */
    setThreshold(threshold) {
        if (threshold >= 0 && threshold <= 100) {
            this.threshold = threshold;
        } else {
            throw new Error('Threshold must be between 0 and 100');
        }
    }

    /**
     * Get the current ruleset
     * @returns {Array} Array of rule objects with patterns, weights, and descriptions
     */
    getRules() {
        return this.rules.map(rule => ({
            pattern: rule.pattern.toString(),
            weight: rule.weight,
            description: rule.description
        }));
    }
}

// Export the filter
window.PromptInjectionFilter = PromptInjectionFilter; 