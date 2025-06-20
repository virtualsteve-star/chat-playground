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

For more information about the test suite, see [../documentation/tests.md](../documentation/tests.md). 