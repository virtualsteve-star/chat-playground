const ContentFilterTestBase = require('./ContentFilterTestBase');
const { PromptInjectionFilter } = require('../scripts/filters/prompt_injection_filter.js');
const { OpenAIPromptInjectionFilter } = require('../scripts/filters/openai_prompt_injection.js');
const fs = require('fs');
const path = require('path');

// Heuristic filter logic
async function simplePromptInjectionCheck(_openai, prompt) {
    const filter = new PromptInjectionFilter();
    await filter.initialize();
    const result = filter.checkMessage(prompt);
    return {
        blocked: result.blocked,
        score: result.score,
        matchedRules: result.matchedRules
    };
}

// AI filter logic
async function aiPromptInjectionCheck(openai, prompt) {
    // Load the prompt template from file (Node.js)
    const templatePath = path.join(__dirname, '../scripts/filters/prompts/openai_prompt_injection.txt');
    const promptTemplate = fs.readFileSync(templatePath, 'utf8');
    const model = 'gpt-4-1106-preview';
    try {
        const userPrompt = promptTemplate.replace('{message}', prompt);
        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'user', content: userPrompt }
            ],
            temperature: 0,
            max_tokens: 256
        });
        const content = response.choices?.[0]?.message?.content;
        if (!content) return { blocked: false };
        let verdict;
        try {
            verdict = JSON.parse(content);
        } catch (e) {
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                verdict = JSON.parse(match[0]);
            } else {
                return { blocked: false };
            }
        }
        const risk = parseInt(verdict.risk_percent, 10);
        const level = (verdict.level || '').toLowerCase();
        const shouldBlock = (risk >= 30) || (level === 'high') || (level === 'critical');
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

class PromptInjectionTest extends ContentFilterTestBase {
    constructor(options = {}) {
        super({
            csvPath: 'tests/data/prompt_test_set.csv',
            blocklistType: 'prompt_injection',
            openaiModerationCheck: aiPromptInjectionCheck
        });
        this.smoke = options.smoke || false;
    }

    // Override to run both filters and report both
    async runAllTests() {
        console.log('🧪 Prompt Injection Filter Test Suite\n');
        console.log('=' .repeat(50));

        const testCases = await this.loadTestCases();
        // If smoke mode is enabled, only run the first 10 test cases
        const casesToRun = this.smoke ? testCases.slice(0, 10) : testCases;
        let totalTime = 0;

        for (const testCase of casesToRun) {
            const startTime = Date.now();
            const [simpleResult, aiResult] = await Promise.all([
                simplePromptInjectionCheck(this.openai, testCase.prompt),
                this.testOpenAIModeration(testCase.prompt)
            ]);
            const responseTime = Date.now() - startTime;
            totalTime += responseTime;
            this.recordTest(
                testCase.prompt,
                testCase.label,
                simpleResult,
                aiResult,
                responseTime
            );
        }

        const blocklistAccuracy = this.calculateAccuracy('blocklist');
        const openaiAccuracy = this.calculateAccuracy('openai');
        console.log('=' .repeat(50));
        console.log('\n📊 Test Summary:');
        console.log(`Total Tests: ${casesToRun.length}`);
        console.log(`Average Response Time: ${(totalTime / casesToRun.length).toFixed(2)}ms`);
        console.log(`Simple Filter Accuracy: ${(blocklistAccuracy * 100).toFixed(1)}%`);
        console.log(`AI Filter Accuracy: ${(openaiAccuracy * 100).toFixed(1)}%`);
        return blocklistAccuracy > 0.9 && openaiAccuracy > 0.9;
    }
}

if (require.main === module) {
    if (!process.env.OPENAI_API_KEY) {
        console.error('Error: OPENAI_API_KEY environment variable is required');
        process.exit(1);
    }
    const smoke = process.argv.includes('--smoke');
    const test = new PromptInjectionTest({ smoke });
    test.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
} 