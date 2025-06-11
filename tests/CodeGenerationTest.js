const ContentFilterTestBase = require('./ContentFilterTestBase');
const { CodeOutputFilter } = require('../scripts/filters/code_output_filter.js');
const fs = require('fs');
const path = require('path');

// Code Output Filter logic
async function codeOutputCheck(_openai, response) {
    const filter = new CodeOutputFilter();
    await filter.initialize();
    const result = filter.checkMessage(response);
    return {
        blocked: result.blocked,
        reason: result.matchedRules?.map(r => r.description).join(', ')
    };
}

class CodeGenerationTest extends ContentFilterTestBase {
    constructor(options = {}) {
        super({
            csvPath: 'tests/data/code_generation_responses_test_set.csv',
            blocklistType: 'code_output',
            openaiModerationCheck: codeOutputCheck
        });
        this.smoke = options.smoke || false;
    }

    // Override to run the code output filter and report results
    async runAllTests() {
        console.log('🧪 Code Generation Response Test Suite\n');
        console.log('=' .repeat(50));

        const testCases = await this.loadTestCases();
        const casesToRun = this.smoke ? testCases.slice(0, 10) : testCases;
        let totalTime = 0;

        for (const testCase of casesToRun) {
            const startTime = Date.now();
            const blocklistResult = await codeOutputCheck(this.openai, testCase.prompt);
            const responseTime = Date.now() - startTime;
            totalTime += responseTime;
            this.recordTest(
                testCase.prompt,
                testCase.label,
                blocklistResult,
                blocklistResult, // Use same result for both blocklist and OpenAI
                responseTime
            );
        }

        const blocklistAccuracy = this.calculateAccuracy('blocklist');
        console.log('=' .repeat(50));
        console.log('\n📊 Test Summary:');
        console.log(`Total Tests: ${casesToRun.length}`);
        console.log(`Average Response Time: ${(totalTime / casesToRun.length).toFixed(2)}ms`);
        console.log(`Blocklist Accuracy: ${(blocklistAccuracy * 100).toFixed(1)}%`);
        return blocklistAccuracy > 0.9;
    }
}

if (require.main === module) {
    const smoke = process.argv.includes('--smoke');
    const test = new CodeGenerationTest({ smoke });
    test.runAllTests().then(success => {
        setTimeout(() => process.exit(success ? 0 : 1), 100);
    }).catch(error => {
        console.error('Test failed:', error);
        setTimeout(() => process.exit(1), 100);
    });
} 