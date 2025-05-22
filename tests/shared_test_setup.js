document.addEventListener('DOMContentLoaded', async () => {
    const config = window.TEST_CONFIG;
    if (!config) {
        throw new Error('No TEST_CONFIG found!');
    }
    // Initialize any custom filters if needed
    if (config.initFilters) await config.initFilters();

    const runner = new PromptTestRunner({
        filters: config.filters,
        csvPath: config.csvPath,
        tableBodyId: config.tableBodyId || 'resultsBody',
        summaryContentId: config.summaryContentId || 'summaryContent',
        loadingId: config.loadingId || 'loading',
        runBtnId: config.runBtnId || 'runTests',
        stopBtnId: config.stopBtnId || 'stopTests',
        positiveLabel: config.positiveLabel || 'RISKY',
    });

    if (config.onRunnerReady) config.onRunnerReady(runner);

    document.getElementById(config.runBtnId || 'runTests').addEventListener('click', () => {
        runner.runAllTests();
    });
    document.getElementById(config.stopBtnId || 'stopTests').addEventListener('click', () => {
        runner.requestStop();
        document.getElementById(config.stopBtnId || 'stopTests').disabled = true;
    });

    try {
        await runner.loadTests();
    } catch (error) {
        console.error('Error initializing tests:', error);
        document.getElementById(config.summaryContentId || 'summaryContent').innerHTML = 
            `<p class="error">Error loading tests: ${error.message}</p>`;
    }
}); 