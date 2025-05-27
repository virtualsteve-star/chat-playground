function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Robust CSV parser for quoted fields, commas, and newlines
function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    while (i < text.length) {
        const char = text[i];
        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\r' && text[i + 1] === '\n') {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
                i++;
            } else if (char === '\n' || char === '\r') {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
            } else {
                field += char;
            }
        }
        i++;
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows;
}

// Centralized OpenAI API key access for all test pages
window.ensureOpenAIApiKey = async function() {
    if (window.apiKeyManager && window.apiKeyManager.require) {
        const keyObj = await window.apiKeyManager.require('openai.chat');
        return keyObj.get();
    }
    // Fallback: try legacy method if APIKeyManager is not loaded
    if (window.ChatUtils && window.ChatUtils.getApiKey) {
        return window.ChatUtils.getApiKey('openai');
    }
    return null;
};

// Utility to check if OpenAI API key is set
window.isOpenAIApiKeySet = async function() {
    if (window.apiKeyManager && window.apiKeyManager.get) {
        try {
            const keyObj = window.apiKeyManager.get('openai.chat');
            return !!(keyObj && keyObj.isSet());
        } catch (e) {
            return false;
        }
    }
    if (window.ChatUtils && window.ChatUtils.getApiKey) {
        return !!window.ChatUtils.getApiKey('openai');
    }
    return false;
};

class PromptTestRunner {
    constructor({
        filters, // Array of { name: string, instance: { check(prompt): Promise|Result } }
        csvPath,
        tableBodyId = 'resultsBody',
        summaryContentId = 'summaryContent',
        loadingId = 'loading',
        runBtnId = 'runTests',
        stopBtnId = 'stopTests',
        positiveLabel = 'RISKY',
    }) {
        this.filters = filters;
        this.csvPath = csvPath;
        this.tableBodyId = tableBodyId;
        this.summaryContentId = summaryContentId;
        this.loadingId = loadingId;
        this.runBtnId = runBtnId;
        this.stopBtnId = stopBtnId;
        this.tests = [];
        this.results = [];
        this.stopRequested = false;
        this.positiveLabel = positiveLabel;
        this.cleanupHandlers = new Set();
    }

    // Add cleanup handler
    addCleanupHandler(handler) {
        this.cleanupHandlers.add(handler);
    }

    // Run cleanup handlers
    async cleanup() {
        for (const handler of this.cleanupHandlers) {
            try {
                await handler();
            } catch (e) {
                console.error('Error in cleanup handler:', e);
            }
        }
        this.cleanupHandlers.clear();
    }

    async loadTests() {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.csvPath}?t=${timestamp}`);
            if (!response.ok) {
                throw new Error(`Failed to load test data: ${response.statusText}`);
            }
            const csvText = await response.text();
            const rows = parseCSV(csvText);
            if (!rows.length) throw new Error('No data found in CSV');
            const header = rows[0].map(h => h.toLowerCase());
            let startIdx = 1;
            if (!header.includes('test_number') && !header.includes('name')) startIdx = 0;
            this.tests = [];
            for (let i = startIdx; i < rows.length; i++) {
                const parts = rows[i];
                if (!parts.length || parts.every(p => !p.trim())) continue;
                try {
                    const test_number = parts[0].replace(/^"|"$/g, '');
                    const expected = parts[1].replace(/^"|"$/g, '');
                    let content;
                    if (header.includes('prompt')) {
                        content = parts[header.indexOf('prompt')];
                    } else if (header.includes('response')) {
                        content = parts[header.indexOf('response')];
                    } else {
                        content = parts.slice(2).join(',').replace(/^"|"$/g, '').replace(/""/g, '"');
                    }
                    this.tests.push({
                        name: header.includes('name') ? test_number : `Test ${test_number}`,
                        expected,
                        prompt: content // Store as prompt regardless of source column name
                    });
                } catch (e) {
                    // Only log actual parse errors
                    console.error('Failed to parse row:', parts, e);
                }
            }
            if (this.tests.length === 0) throw new Error('No tests were loaded from the CSV file');
        } catch (e) {
            console.error('Error loading tests:', e);
            throw e;
        }
    }

    requestStop() {
        this.stopRequested = true;
    }

    async runTest(test) {
        const results = [];
        for (const filter of this.filters) {
            let verdict = { blocked: false };
            let time = 0;
            let skippedDueToKey = false;
            try {
                // If this filter is an OpenAI filter and key is missing, skip
                if (filter.name.toLowerCase().includes('openai') || filter.name.toLowerCase().includes('ai filter')) {
                    const keySet = await window.isOpenAIApiKeySet();
                    if (!keySet) {
                        skippedDueToKey = true;
                        verdict = { skipped: true };
                        results.push({ name: filter.name, skipped: true, time: 0 });
                        continue;
                    }
                }
                const start = performance.now();
                if (!filter.instance || typeof filter.instance.check !== 'function') {
                    throw new Error(`Filter ${filter.name} has no check() method`);
                }
                const res = await filter.instance.check(test.prompt);
                time = performance.now() - start;
                verdict = res;
                if (!verdict || typeof verdict.blocked === 'undefined') {
                    throw new Error(`Filter ${filter.name} returned invalid result: ${JSON.stringify(verdict)}`);
                }
            } catch (e) {
                if (!skippedDueToKey) {
                    verdict = { blocked: false, error: e.message || 'Error' };
                    console.error(`Error in filter ${filter.name} for test "${test.name}":`, e);
                }
            }
            if (!skippedDueToKey) {
                results.push({
                    name: filter.name,
                    blocked: verdict.blocked,
                    error: verdict.error,
                    time,
                    skipped: verdict.skipped
                });
            }
        }
        return results;
    }

    async runAllTests() {
        const loading = document.getElementById(this.loadingId);
        const runButton = document.getElementById(this.runBtnId);
        const stopButton = document.getElementById(this.stopBtnId);
        const resultsBody = document.getElementById(this.tableBodyId);
        const summaryContent = document.getElementById(this.summaryContentId);

        try {
            loading.style.display = 'block';
            runButton.disabled = true;
            stopButton.style.display = 'inline-block';
            stopButton.disabled = false;
            resultsBody.innerHTML = '';

            let correct = Array(this.filters.length).fill(0);
            let times = Array(this.filters.length).fill(null).map(() => []);
            let skipped = Array(this.filters.length).fill(false);
            let testsRun = 0;

            // Pre-check which filters will be skipped due to missing key
            for (let idx = 0; idx < this.filters.length; idx++) {
                const filter = this.filters[idx];
                if (filter.name.toLowerCase().includes('openai') || filter.name.toLowerCase().includes('ai filter')) {
                    const keySet = await window.isOpenAIApiKeySet();
                    if (!keySet) {
                        skipped[idx] = true;
                    }
                }
            }

            this.stopRequested = false;
            for (let i = 0; i < this.tests.length; i++) {
                const test = this.tests[i];
                if (this.stopRequested) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="${3 + 2 * this.filters.length}" style="text-align:center;color:#dc3545;">Test stopped by user.</td>`;
                    resultsBody.appendChild(row);
                    break;
                }
                let verdicts;
                try {
                    verdicts = await this.runTest(test);
                } catch (e) {
                    verdicts = this.filters.map(f => ({ blocked: false, error: e.message || 'Error', time: 0 }));
                }
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHTML(test.name)}</td>
                    <td>${escapeHTML(test.expected)}</td>
                    ${verdicts.map((v, idx) => {
                        if (skipped[idx] || v.skipped) {
                            return `<td style="color:#007bff;font-weight:bold;text-align:center;">–</td>`;
                        }
                        const isCorrect = (!v.error && (
                            (v.blocked && test.expected === this.positiveLabel) ||
                            (!v.blocked && test.expected === 'BENIGN')
                        ));
                        return `<td class="${v.error ? 'incorrect' : isCorrect ? 'correct' : 'incorrect'}">${escapeHTML(v.error ? '⚠️' : (isCorrect ? '✓' : '✗'))}</td>`;
                    }).join('')}
                    ${verdicts.map((v, idx) => (skipped[idx] || v.skipped) ? `<td style="color:#007bff;text-align:center;">–</td>` : `<td>${escapeHTML(v.time.toFixed(2))}</td>`).join('')}
                `;
                if (verdicts.some(v => v.error)) {
                    row.title = escapeHTML(verdicts.map(v => v.error).filter(Boolean).join('; '));
                }
                resultsBody.appendChild(row);
                verdicts.forEach((v, idx) => {
                    if (!skipped[idx] && !v.error && ((v.blocked && test.expected === this.positiveLabel) || (!v.blocked && test.expected === 'BENIGN'))) correct[idx]++;
                    if (!skipped[idx]) times[idx].push(v.time);
                });
                testsRun++;
            }

            // Summary
            let summaryHtml = '';
            this.filters.forEach((filter, idx) => {
                if (skipped[idx]) {
                    summaryHtml += `<p style="color:#007bff;"><strong>${escapeHTML(filter.name)}:</strong> Not run due to missing API key</p>`;
                    return;
                }
                const accuracy = testsRun ? (correct[idx] / testsRun * 100).toFixed(1) : '0.0';
                const avg = times[idx].length ? (times[idx].reduce((a, b) => a + b, 0) / times[idx].length) : 0;
                const sorted = [...times[idx]].sort((a, b) => a - b);
                const median = sorted.length % 2 === 0 && sorted.length > 0
                    ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
                    : sorted[Math.floor(sorted.length/2)] || 0;
                const stddev = times[idx].length ? Math.sqrt(times[idx].reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / times[idx].length) : 0;
                summaryHtml += `
                    <p><strong>${escapeHTML(filter.name)}:</strong> ${escapeHTML(accuracy)}% accuracy (${escapeHTML(correct[idx])}/${escapeHTML(testsRun)} correct)</p>
                    <p><strong>${escapeHTML(filter.name)} Times (ms):</strong></p>
                    <ul>
                        <li>Average: ${escapeHTML(avg.toFixed(2))}</li>
                        <li>Median: ${escapeHTML(median.toFixed(2))}</li>
                        <li>Standard Deviation: ${escapeHTML(stddev.toFixed(2))}</li>
                    </ul>
                `;
            });
            summaryContent.innerHTML = summaryHtml;
            const summary = document.getElementById('summary');
            if (summary) summary.style.display = 'block';
        } catch (e) {
            console.error('Error running tests:', e);
            throw e;
        } finally {
            loading.style.display = 'none';
            runButton.disabled = false;
            stopButton.style.display = 'none';
            await this.cleanup();
        }
    }
} 