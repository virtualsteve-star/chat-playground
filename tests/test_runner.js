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
    }

    async loadTests() {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${this.csvPath}?t=${timestamp}`);
            if (!response.ok) {
                throw new Error(`Failed to load test data: ${response.statusText}`);
            }
            const csvText = await response.text();
            const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
            let startIdx = 1;
            const header = lines[0].toLowerCase();
            if (!header.includes('test_number') && !header.includes('name')) startIdx = 0;
            this.tests = [];
            for (let i = startIdx; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                try {
                    const parts = [];
                    let current = '';
                    let inQuotes = false;
                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            parts.push(current);
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    parts.push(current);
                    const test_number = parts[0].replace(/^"|"$/g, '');
                    const expected = parts[1].replace(/^"|"$/g, '');
                    let content;
                    if (header.includes('prompt')) {
                        content = parts.slice(2).join(',').replace(/^"|"$/g, '').replace(/""/g, '"');
                    } else if (header.includes('response')) {
                        content = parts.slice(2).join(',').replace(/^"|"$/g, '').replace(/""/g, '"');
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
                    console.error('Failed to parse line:', line, e);
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
            try {
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
                verdict = { blocked: false, error: e.message || 'Error' };
                console.error(`Error in filter ${filter.name} for test "${test.name}":`, e);
            }
            results.push({
                name: filter.name,
                blocked: verdict.blocked,
                error: verdict.error,
                time
            });
        }
        return results;
    }

    async runAllTests() {
        const loading = document.getElementById(this.loadingId);
        const runButton = document.getElementById(this.runBtnId);
        const stopButton = document.getElementById(this.stopBtnId);
        const resultsBody = document.getElementById(this.tableBodyId);
        const summaryContent = document.getElementById(this.summaryContentId);

        loading.style.display = 'block';
        runButton.disabled = true;
        stopButton.style.display = 'inline-block';
        stopButton.disabled = false;
        resultsBody.innerHTML = '';

        let correct = Array(this.filters.length).fill(0);
        let times = Array(this.filters.length).fill(null).map(() => []);
        let testsRun = 0;

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
                <td>${test.name}</td>
                <td>${test.expected}</td>
                ${verdicts.map((v, idx) => {
                    const isCorrect = (!v.error && (
                        (v.blocked && test.expected === this.positiveLabel) ||
                        (!v.blocked && test.expected === 'BENIGN')
                    ));
                    const reason = v.reason !== undefined ? v.reason : '';
                    return `<td class="${v.error ? 'incorrect' : isCorrect ? 'correct' : 'incorrect'}">${v.error ? '⚠️' : (isCorrect ? '✓' : '✗')}</td>`;
                }).join('')}
                ${verdicts.map(v => `<td>${v.time.toFixed(2)}</td>`).join('')}
            `;
            if (verdicts.some(v => v.error)) {
                row.title = verdicts.map(v => v.error).filter(Boolean).join('; ');
            }
            resultsBody.appendChild(row);
            verdicts.forEach((v, idx) => {
                if (!v.error && ((v.blocked && test.expected === this.positiveLabel) || (!v.blocked && test.expected === 'BENIGN'))) correct[idx]++;
                times[idx].push(v.time);
            });
            testsRun++;
        }
        // Summary
        let summaryHtml = '';
        this.filters.forEach((filter, idx) => {
            const accuracy = testsRun ? (correct[idx] / testsRun * 100).toFixed(1) : '0.0';
            const avg = times[idx].length ? (times[idx].reduce((a, b) => a + b, 0) / times[idx].length) : 0;
            const sorted = [...times[idx]].sort((a, b) => a - b);
            const median = sorted.length % 2 === 0 && sorted.length > 0
                ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
                : sorted[Math.floor(sorted.length/2)] || 0;
            const stddev = times[idx].length ? Math.sqrt(times[idx].reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / times[idx].length) : 0;
            summaryHtml += `
                <p><strong>${filter.name}:</strong> ${accuracy}% accuracy (${correct[idx]}/${testsRun} correct)</p>
                <p><strong>${filter.name} Times (ms):</strong></p>
                <ul>
                    <li>Average: ${avg.toFixed(2)}</li>
                    <li>Median: ${median.toFixed(2)}</li>
                    <li>Standard Deviation: ${stddev.toFixed(2)}</li>
                </ul>
            `;
        });
        summaryContent.innerHTML = summaryHtml;
        const summary = document.getElementById('summary');
        if (summary) summary.style.display = 'block';

        loading.style.display = 'none';
        runButton.disabled = false;
        stopButton.style.display = 'none';
    }
} 