# CLI Test Suites for Content Filters

This project includes CLI-based test suites for evaluating the accuracy of content filters (sexual content, violence, and prompt injection) using both local blocklists and OpenAI's moderation API.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **OpenAI API Key**

You must set your OpenAI API key as an environment variable before running the tests:

```sh
export OPENAI_API_KEY=sk-...
```

Or, create a `.env` file in the project root with:

```
OPENAI_API_KEY=sk-...
```

## Running the Tests

Navigate to the project root and run any of the following commands:

### Sexual Content Filter Test
```sh
node tests/SexualContentTest.js
```

### Violence Content Filter Test
```sh
node tests/ViolenceContentTest.js
```

### Prompt Injection Filter Test
```sh
node tests/PromptInjectionTest.js
```

### Code Generation Response Filter Test
```sh
node tests/CodeGenerationTest.js
```

### CSS Architecture Test
```sh
node tests/CSSArchitectureTest.js
```

The CSS Architecture Test validates the consolidated CSS system for:
- Core CSS file structure and variable count
- Theme completeness (iMessage, Dark Mode, Green Screen)
- HTML integration and proper CSS references
- CSS structural integrity and balanced braces
- JavaScript dependencies
- Performance metrics (file size and line count)
- Button structure integrity

## Smoke Test Mode (Faster Iteration)

To run only the first 10 test cases (for quick iteration and lower token costs), add the `--smoke` flag to any test command:

```sh
node tests/SexualContentTest.js --smoke
node tests/ViolenceContentTest.js --smoke
node tests/PromptInjectionTest.js --smoke
node tests/CodeGenerationTest.js --smoke
```

Note: The CSS Architecture Test does not support smoke mode as it runs a fixed set of structural tests.

## Output

Each test suite will print a summary table showing the accuracy of both the blocklist and OpenAI filters, as well as per-case results and average response time.

The CSS Architecture Test provides:
- Individual test results with ✅/❌ indicators
- Overall test summary (X/Y test suites passed)
- Architecture metrics (CSS variables, selectors, lines of code, file size)
- Failed test details if any tests fail

## Notes
- The test CSVs are located in `tests/data/`.
- The CLI tests are designed to match the browser-based test logic for parity.
- If you encounter errors about missing dependencies or API keys, ensure your environment is set up as described above. 