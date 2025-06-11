require('dotenv').config();

// Mock browser environment
global.window = {
    apiKeyManager: {
        register: () => {}
    }
};

const { BlocklistFilter } = require('../scripts/filters/blocklist.js');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

class ContentFilterTestBase {
    constructor({
        csvPath,
        blocklistType,
        openaiModerationCheck
    }) {
        this.testResults = [];
        this.projectRoot = path.join(__dirname, '..');
        this.csvPath = csvPath;
        this.blocklistType = blocklistType;
        this.openaiModerationCheck = openaiModerationCheck;
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

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

    async loadTestCases() {
        const csvPath = path.join(this.projectRoot, this.csvPath);
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n');
        
        // Parse header
        let headerLine = lines[0];
        let header = [];
        let inQuotes = false;
        let field = '';
        for (let i = 0; i < headerLine.length; i++) {
            const char = headerLine[i];
            if (char === '"') {
                if (inQuotes && headerLine[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                header.push(field.trim().replace(/^"|"$/g, ''));
                field = '';
            } else {
                field += char;
            }
        }
        header.push(field.trim().replace(/^"|"$/g, ''));

        // Parse rows
        const testCases = [];
        let currentRow = [];
        inQuotes = false;
        field = '';

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    if (inQuotes && line[j + 1] === '"') {
                        field += '"';
                        j++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    currentRow.push(field.trim().replace(/^"|"$/g, ''));
                    field = '';
                } else {
                    field += char;
                }
            }

            if (inQuotes) {
                field += '\n';
                continue;
            }

            currentRow.push(field.trim().replace(/^"|"$/g, ''));
            field = '';

            if (currentRow.length === header.length) {
                const obj = {};
                for (let k = 0; k < header.length; k++) {
                    let col = header[k].trim().replace(/^"|"$/g, '').toLowerCase();
                    let val = currentRow[k].trim().replace(/^"|"$/g, '');
                    // Support both (expected, response) and (label, prompt) column names
                    if (col === 'response' || col === 'prompt') obj.prompt = val;
                    else if (col === 'expected' || col === 'label') obj.label = val;
                }
                if (!obj.prompt || !obj.label) {
                    console.warn(`Skipping malformed row ${i + 1}:`, currentRow);
                } else {
                    testCases.push(obj);
                }
            }
            currentRow = [];
        }

        return testCases;
    }

    async initializeBlocklist() {
        return new BlocklistFilter();
    }

    async testBlocklist(prompt) {
        const blocklistFilter = await this.initializeBlocklist();
        await blocklistFilter.initialize();
        const result = blocklistFilter.checkMessageWithSelection(prompt, [this.blocklistType]);
        return result.blocked ? { blocked: true, reason: 'blocklist', list: result.list, term: result.term } : { blocked: false };
    }

    async testOpenAIModeration(prompt) {
        return await this.openaiModerationCheck(this.openai, prompt);
    }

    async runAllTests() {
        console.log(`🧪 ${this.blocklistType.charAt(0).toUpperCase() + this.blocklistType.slice(1)} Content Filter Test Suite\n`);
        console.log('=' .repeat(50));

        const testCases = await this.loadTestCases();
        let totalTime = 0;

        for (const testCase of testCases) {
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
        console.log(`Total Tests: ${testCases.length}`);
        console.log(`Average Response Time: ${(totalTime / testCases.length).toFixed(2)}ms`);
        console.log(`Blocklist Accuracy: ${(blocklistAccuracy * 100).toFixed(1)}%`);
        console.log(`OpenAI Accuracy: ${(openaiAccuracy * 100).toFixed(1)}%`);
        return blocklistAccuracy > 0.9 && openaiAccuracy > 0.9;
    }

    calculateAccuracy(filterType) {
        const correct = this.testResults.filter(result => {
            const filterResult = filterType === 'blocklist' ? result.blocklistResult : result.openaiResult;
            if (!filterResult) return false;
            const expected = (result.expected || '').trim().toUpperCase();
            return (expected === 'RISKY' && filterResult.blocked) ||
                   (expected === 'BENIGN' && !filterResult.blocked);
        }).length;
        return correct / this.testResults.length;
    }
}

module.exports = ContentFilterTestBase; 