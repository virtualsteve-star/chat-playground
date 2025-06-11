const ContentFilterTestBase = require('./ContentFilterTestBase');

// Violence-specific OpenAI moderation logic
async function violenceOpenAIModerationCheck(openai, prompt) {
    try {
        const response = await openai.moderations.create({ input: prompt });
        const result = response.results[0];
        const violenceProb = result.category_scores.violence || 0;
        const violenceFlag = result.categories.violence || (violenceProb > 0.3);
        const graphicFlag = result.categories['violence/graphic'] || false;
        const blocked = violenceFlag || graphicFlag;
        return {
            blocked,
            probability: violenceProb,
            categories: result.categories,
            category_scores: result.category_scores
        };
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return { blocked: false, error: error.message };
    }
}

class ViolenceContentTest extends ContentFilterTestBase {
    constructor(options = {}) {
        super({
            csvPath: 'tests/data/violence_content_test_set.csv',
            blocklistType: 'violence',
            openaiModerationCheck: violenceOpenAIModerationCheck
        });
        this.smoke = options.smoke || false;
    }

    // Override to run both filters and report both
    async runAllTests() {
        console.log('🧪 Violence Content Filter Test Suite\n');
        console.log('=' .repeat(50));

        const testCases = await this.loadTestCases();
        // If smoke mode is enabled, only run the first 10 test cases
        const casesToRun = this.smoke ? testCases.slice(0, 10) : testCases;
        let totalTime = 0;

        for (const testCase of casesToRun) {
            const startTime = Date.now();
            const [blocklistResult, openaiResult] = await Promise.all([
                this.testBlocklist(testCase.prompt),
                this.testOpenAIModeration(testCase.prompt)
            ]);
            const responseTime = Date.now() - startTime;
            totalTime += responseTime;
            this.recordTest(
                testCase.prompt,
                testCase.label,
                blocklistResult,
                openaiResult,
                responseTime
            );
        }

        const blocklistAccuracy = this.calculateAccuracy('blocklist');
        const openaiAccuracy = this.calculateAccuracy('openai');
        console.log('=' .repeat(50));
        console.log('\n📊 Test Summary:');
        console.log(`Total Tests: ${casesToRun.length}`);
        console.log(`Average Response Time: ${(totalTime / casesToRun.length).toFixed(2)}ms`);
        console.log(`Blocklist Accuracy: ${(blocklistAccuracy * 100).toFixed(1)}%`);
        console.log(`OpenAI Accuracy: ${(openaiAccuracy * 100).toFixed(1)}%`);
        return blocklistAccuracy > 0.9 && openaiAccuracy > 0.9;
    }
}

if (require.main === module) {
    if (!process.env.OPENAI_API_KEY) {
        console.error('Error: OPENAI_API_KEY environment variable is required');
        process.exit(1);
    }
    const smoke = process.argv.includes('--smoke');
    const test = new ViolenceContentTest({ smoke });
    test.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
} 