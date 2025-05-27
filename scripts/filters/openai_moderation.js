/**
 * OpenAI Moderation API Filter Implementation
 * Extends the generic APIFilter to provide OpenAI-based moderation checks.
 */

class OpenAIModerationFilter extends APIFilter {
    constructor() {
        super('openai_moderation');
    }

    async check(message, options = {}) {
        const { checkSex = false, checkViolence = false } = options;
        let apiKey = null;
        if (window.apiKeyManager && window.apiKeyManager.get) {
            const keyObj = window.apiKeyManager.get('openai.chat');
            apiKey = keyObj && keyObj.isSet() ? keyObj.get() : null;
        }
        if (!apiKey) {
            return { blocked: true, reason: 'no_api_key' };
        }
        try {
            const response = await fetch('https://api.openai.com/v1/moderations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ input: message })
            });
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            if (!data.results || !data.results[0]) return { blocked: false };
            const result = data.results[0];
            let sexProb = result.category_scores.sexual || 0;
            let violenceProb = result.category_scores.violence || 0;
            let sexFlag = result.categories.sexual || (sexProb > 0.3);
            let violenceFlag = result.categories.violence || (violenceProb > 0.3);
            if (checkSex && sexFlag) {
                return { blocked: true, reason: 'openai_sex', probability: sexProb };
            }
            if (checkViolence && violenceFlag) {
                return { blocked: true, reason: 'openai_violence', probability: violenceProb };
            }
            return { blocked: false };
        } catch (e) {
            return { blocked: true, reason: 'api_error' };
        }
    }
}

// Export the filter
window.OpenAIModerationFilter = OpenAIModerationFilter; 