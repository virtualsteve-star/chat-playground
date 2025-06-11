# CLI Tests

This directory contains CLI-based tests that can be run from the command line.

## CSS Architecture Test

The CSS Architecture Test validates the structural integrity and configuration of our consolidated CSS system.

### Running the Test

```bash
node tests/CSSArchitectureTest.js
```

### What it Tests

1. **CSS File Structure**
   - Verifies main-optimized.css exists
   - Checks for sufficient CSS variables (100+)
   - Ensures no !important declarations

2. **Theme Completeness**
   - Validates presence of required themes:
     - iMessage theme
     - Dark mode
     - Green screen

3. **HTML Integration**
   - Checks proper CSS file references
   - Verifies no old CSS file references
   - Tests theme switching capability

4. **CSS Structural Integrity**
   - Validates balanced braces
   - Checks for critical CSS sections
   - Verifies proper organization

5. **JavaScript Dependencies**
   - Ensures required script files exist
   - Validates core dependencies

6. **Performance Metrics**
   - Checks CSS file size (< 50KB)
   - Validates line count (< 1500 lines)

7. **Button Structure**
   - Verifies toolbar button classes
   - Checks button icon structure
   - Validates CSS class usage

### Test Output

The test provides detailed output for each check, including:
- Pass/fail status for each test
- Detailed failure information
- Performance metrics
- Architecture statistics

### Example Output

```
🧪 CSS Architecture Smoke Test
==================================================
✅ PASS: CSS File Exists
✅ PASS: CSS Variables Count - 150 variables defined
✅ PASS: No !important Usage - 0 !important declarations
...
==================================================

📊 Test Summary: 7/7 test suites passed
🎉 All tests passed! CSS architecture is healthy.

📈 Architecture Metrics:
   CSS Variables: 150
   CSS Selectors: 300
   Lines of Code: 1200
   File Size: 45.2KB
   Extensibility: ~3-5 lines for new themes
``` 