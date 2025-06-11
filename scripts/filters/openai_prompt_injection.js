/**
 * OpenAI Prompt Injection Filter (GPT-4.1-nano)
 * Uses OpenAI's GPT-4.1-nano to detect prompt injection attempts via a compact JSON contract prompt.
 */

class OpenAIPromptInjectionFilter extends window.APIFilter {
    constructor() {
        super('openai_prompt_injection');
        this.model = 'gpt-4-1106-preview'; // Use the latest cost-effective nano model
        this.threshold = 30; // Block if risk_percent >= 30
        this.promptTemplate = null;
    }

    async loadPromptTemplate() {
        if (this.promptTemplate) return this.promptTemplate;
        
        try {
            // Add cache-busting query string
            const cacheBustedPath = 'scripts/filters/prompts/openai_prompt_injection.txt' + 
                '?v=' + Date.now();
            const response = await fetch(cacheBustedPath);
            if (!response.ok) throw new Error('Failed to load prompt template');
            this.promptTemplate = await response.text();
            return this.promptTemplate;
        } catch (error) {
            console.error('Error loading prompt template:', error);
            throw error;
        }
    }

    async check(message, options = {}) {
        let apiKey = null;
        if (window.apiKeyManager && window.apiKeyManager.get) {
            const keyObj = window.apiKeyManager.get('openai.chat');
            apiKey = keyObj && keyObj.isSet() ? keyObj.get() : null;
        }
        if (!apiKey) {
            return { blocked: true, reason: 'no_api_key' };
        }
        try {
            const promptTemplate = await this.loadPromptTemplate();
            const prompt = promptTemplate.replace('{message}', message);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0,
                    max_tokens: 256
                })
            });
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) return { blocked: false };
            let verdict;
            try {
                verdict = JSON.parse(content);
            } catch (e) {
                // Try to extract JSON from text if model added extra text
                const match = content.match(/\{[\s\S]*\}/);
                if (match) {
                    verdict = JSON.parse(match[0]);
                } else {
                    return { blocked: false };
                }
            }
            const risk = parseInt(verdict.risk_percent, 10);
            const level = (verdict.level || '').toLowerCase();
            const shouldBlock = (risk >= this.threshold) || (level === 'high') || (level === 'critical');
            return {
                blocked: shouldBlock,
                risk_percent: risk,
                level,
                indicators: verdict.indicators || [],
                comment: verdict.comment || '',
                raw: verdict
            };
        } catch (e) {
            return { blocked: true, reason: 'api_error' };
        }
    }

    getRejectionMessage(result) {
        if (result.reason === 'no_api_key') {
            return 'OpenAI API key is required for this filter.';
        }
        if (result.reason === 'api_error') {
            return 'Error contacting OpenAI for prompt injection analysis.';
        }
        let msg = `I'm sorry, but I cannot process this request as it appears to contain a prompt injection attempt (OpenAI risk: ${result.risk_percent}%, level: ${result.level}).`;
        if (result.comment) {
            msg += `\nReason: ${result.comment}`;
        }
        return msg;
    }
}

// Export the filter
window.OpenAIPromptInjectionFilter = OpenAIPromptInjectionFilter;

// Node.js/CommonJS export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OpenAIPromptInjectionFilter };
} 