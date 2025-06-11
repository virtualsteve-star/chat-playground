require('dotenv').config();

// Mock browser environment
global.window = {
    apiKeyManager: {
        register: () => {}
    }
};

const { BlocklistFilter } = require('../scripts/filters/blocklist.js');

/**
 * Sexual Content Filter Test Suite
 * Validates the content filtering system for both local blocklist and OpenAI moderation
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

class SexualContentTest {
    constructor(options = {}) {
        this.testResults = [];
        this.projectRoot = path.join(__dirname, '..');
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.smoke = options.smoke || false;
    }

    // Helper to record test results
    recordTest(testName, expected, blocklistResult, openaiResult, responseTime) {
        this.testResults.push({
            test: testName,
            expected,
            blocklistResult,
            openaiResult,
            responseTime
        });
        
        const blocklistStatus = blocklistResult.blocked ? '✅' : '❌';
        const openaiStatus = openaiResult.blocked ? '✅' : '❌';
        console.log(`${testName}:`);
        console.log(`  Expected: ${expected}`);
        console.log(`  Blocklist: ${blocklistStatus} (${blocklistResult.blocked ? 'blocked' : 'allowed'})`);
        console.log(`  OpenAI: ${openaiStatus} (${openaiResult.blocked ? 'blocked' : 'allowed'})`);
        console.log(`  Response Time: ${responseTime}ms\n`);
    }

    // Load test cases from CSV (cleaned up)
    async loadTestCases() {
        const csvPath = path.join(this.projectRoot, 'tests/data/sexual_content_test_set.csv');
        const csv = fs.readFileSync(csvPath, 'utf8');
        const lines = csv.split('\n').filter(Boolean);
        const header = lines[0].replace(/\r/g, '').split(',').map(s => s.replace(/"/g, '').trim());
        const promptIdx = header.indexOf('prompt');
        const labelIdx = header.indexOf('label');
        if (promptIdx === -1 || labelIdx === -1) throw new Error('CSV missing prompt or label columns');
        const testCases = lines.slice(1).map(line => {
            const cols = line.replace(/\r/g, '').split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, ''));
            return { prompt: cols[promptIdx], expected: cols[labelIdx] === 'RISKY' };
        });
        return testCases;
    }

    // Initialize blocklist filter
    async initializeBlocklist() {
        return new BlocklistFilter();
    }

    // Test blocklist filter (cleaned up)
    async testBlocklist(prompt) {
        const blocklistFilter = await this.initializeBlocklist();
        await blocklistFilter.initialize();
        const result = blocklistFilter.checkMessageWithSelection(prompt, ['sex']);
        return result.blocked ? { blocked: true, reason: 'blocklist', list: result.list, term: result.term } : { blocked: false };
    }

    // Test OpenAI moderation (cleaned up)
    async testOpenAIModeration(prompt) {
        try {
            const response = await this.openai.moderations.create({
                input: prompt
            });
            const result = response.results[0];
            const sexProb = result.category_scores.sexual || 0;
            const sexFlag = result.categories.sexual || (sexProb > 0.3);
            const minorsFlag = result.categories['sexual/minors'] || false;
            const blocked = sexFlag || minorsFlag;
            return {
                blocked,
                probability: sexProb,
                categories: result.categories,
                category_scores: result.category_scores
            };
        } catch (error) {
            console.error('OpenAI API Error:', error);
            return { blocked: false, error: error.message };
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Sexual Content Filter Test Suite\n');
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
                testCase.expected,
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

    // Calculate accuracy for a specific filter
    calculateAccuracy(filterType) {
        const correct = this.testResults.filter(result => {
            const filterResult = filterType === 'blocklist' ? result.blocklistResult : result.openaiResult;
            return filterResult.blocked === result.expected;
        }).length;
        return correct / this.testResults.length;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SexualContentTest;
}

// Run tests if called directly
if (require.main === module) {
    if (!process.env.OPENAI_API_KEY) {
        console.error('Error: OPENAI_API_KEY environment variable is required');
        process.exit(1);
    }
    const smoke = process.argv.includes('--smoke');
    const test = new SexualContentTest({ smoke });
    test.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
} 