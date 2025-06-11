# Guardrail Test Suite

To run the guardrail test suite, open `tests/index.html` in your browser. **Note:** You'll need to serve the files over HTTP (for example, using `python3 -m http.server`) as described in the main project's README.

All test data files (`.csv` and `.txt`) are now located in the `tests/data/` folder.

You can also run individual category tests (Prompt Injection, Sexual Content, Violence, Code Generation) using the corresponding HTML files in this folder (e.g., `PromptInjectTest.html`). These tests will automatically load their data from the `data/` subfolder.

## SimpleBot Smoke Test

A new "SimpleBot Smoke Test" is available for end-to-end testing of SimpleBot and all local guardrails filters (except rate limit). This test runs all prompts from `tests/data/testprompts.txt` through the main chat UI.
- Launch it from the Test Suites page, or
- Open the main app with `?test-local` (e.g., `index.html?test-local`).

No additional setup is required.

## OpenAI Smoke Test

The "OpenAI Smoke Test" runs all prompts through the main chat UI using the Bob (Tech Support, GPT) personality and all OpenAI-powered filters.

**Note:** This test requires an OpenAI API key to be set in Preferences. If the key is missing, the test will not run.

## CSS Architecture Test

The **CSSArchitectureTest.js** validates the consolidated CSS system for structural integrity and performance:

**What it tests:**
- CSS structure (proper variable usage, no `!important` declarations)
- Theme completeness (vanilla, iMessage, dark mode, green screen)
- HTML integration (proper CSS references, no legacy dependencies)  
- Performance metrics (file size, complexity)
- JavaScript compatibility (required script dependencies)

**Usage:**
```bash
# Run standalone validation
node tests/CSSArchitectureTest.js

# Import in other test files
const CSSArchitectureTest = require('./CSSArchitectureTest');
const test = new CSSArchitectureTest();
test.runAllTests();
```

This test is essential for maintaining the health of the consolidated CSS architecture and should be run after any styling changes.

For more information about the test suite, see [../documentation/tests.md](../documentation/tests.md). 