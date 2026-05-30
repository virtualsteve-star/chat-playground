/**
 * OpenAI Moderation Filter
 * Uses GPT-4.1-nano via chat completions (the /v1/moderations endpoint
 * does not support CORS from browser origins).
 */

class OpenAIModerationFilter extends APIFilter {
    constructor() {
        super('openai_moderation');
        this.model = 'gpt-4.1-nano';
        this.promptTemplate = null;
    }

    getPromptTemplate() {
        return `You are a content moderation classifier.

Task: Inspect the text inside <<<…>>> and evaluate it for harmful content.
Return ONLY valid JSON with these keys:
  "sexual"          : boolean (true if content is sexual or explicit)
  "violence"        : boolean (true if content glorifies or describes graphic violence)
  "sexual_score"    : number 0.0-1.0 (confidence for sexual flag)
  "violence_score"  : number 0.0-1.0 (confidence for violence flag)

Text to analyse:
<<<{message}>>>`;
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
            const prompt = this.getPromptTemplate().replace('{message}', message);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0,
                    max_tokens: 128
                })
            });
            if (!response.ok) {
                const errText = await response.text();
                console.error('OpenAI Moderation error', response.status, errText);
                throw new Error('API error');
            }
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) return { blocked: false };
            let result;
            try {
                result = JSON.parse(content);
            } catch (e) {
                const match = content.match(/\{[\s\S]*\}/);
                result = match ? JSON.parse(match[0]) : null;
            }
            if (!result) return { blocked: false };
            const sexFlag = result.sexual || (result.sexual_score > 0.3);
            const violenceFlag = result.violence || (result.violence_score > 0.3);
            if (checkSex && sexFlag) {
                return { blocked: true, reason: 'openai_sex', probability: result.sexual_score || 0 };
            }
            if (checkViolence && violenceFlag) {
                return { blocked: true, reason: 'openai_violence', probability: result.violence_score || 0 };
            }
            return { blocked: false };
        } catch (e) {
            return { blocked: true, reason: 'api_error' };
        }
    }
}

// Export the filter
window.OpenAIModerationFilter = OpenAIModerationFilter;
