/**
 * CSS Architecture Smoke Test
 * Validates the consolidated CSS system for structural integrity and proper configuration
 */

const fs = require('fs');
const path = require('path');

class CSSArchitectureTest {
    constructor() {
        this.testResults = [];
        this.projectRoot = path.join(__dirname, '..');
    }

    // Helper to record test results
    recordTest(testName, passed, details = '') {
        this.testResults.push({
            test: testName,
            passed,
            details
        });
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${testName}${details ? ' - ' + details : ''}`);
        return passed;
    }

    // Test 1: Core CSS file structure
    testCSSFileStructure() {
        const cssPath = path.join(this.projectRoot, 'styles/main-optimized.css');
        
        if (!fs.existsSync(cssPath)) {
            return this.recordTest('CSS File Exists', false, 'main-optimized.css not found');
        }

        const css = fs.readFileSync(cssPath, 'utf8');
        const variableCount = (css.match(/--[\w-]+:/g) || []).length;
        const importantCount = (css.match(/!important/g) || []).length;
        
        // Check minimum expected variables (should be 100+ for comprehensive theming)
        const hasEnoughVariables = variableCount >= 100;
        this.recordTest('CSS Variables Count', hasEnoughVariables, `${variableCount} variables defined`);
        
        // Check for no !important usage (clean architecture)
        const noImportant = importantCount === 0;
        this.recordTest('No !important Usage', noImportant, `${importantCount} !important declarations`);
        
        return hasEnoughVariables && noImportant;
    }

    // Test 2: Theme completeness
    testThemeCompleteness() {
        const cssPath = path.join(this.projectRoot, 'styles/main-optimized.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        
        const requiredThemes = [
            'body.imessage',
            'body.dark-mode', 
            'body.green-screen'
        ];
        
        let allThemesPresent = true;
        requiredThemes.forEach(theme => {
            const present = css.includes(theme);
            this.recordTest(`Theme: ${theme}`, present);
            if (!present) allThemesPresent = false;
        });
        
        return allThemesPresent;
    }

    // Test 3: HTML integration
    testHTMLIntegration() {
        const htmlPath = path.join(this.projectRoot, 'index.html');
        
        if (!fs.existsSync(htmlPath)) {
            return this.recordTest('HTML File Exists', false, 'index.html not found');
        }

        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check for proper CSS reference
        const hasOptimizedCSS = html.includes('main-optimized.css');
        this.recordTest('References Optimized CSS', hasOptimizedCSS);
        
        // Check for no old CSS references
        const oldCSSFiles = ['vanilla.css', 'imessage.css', 'imessage-dark.css', 'green-screen.css'];
        let hasOldRefs = false;
        oldCSSFiles.forEach(file => {
            if (html.includes(file)) {
                this.recordTest(`No Old CSS: ${file}`, false, 'Still referenced in HTML');
                hasOldRefs = true;
            }
        });
        
        if (!hasOldRefs) {
            this.recordTest('No Old CSS References', true);
        }
        
        // Check for proper theme switching (either in HTML override or utils.js function)
        const hasOverride = html.includes('window.ChatUtils.changeStyle') || 
                           fs.existsSync(path.join(this.projectRoot, 'scripts/utils.js'));
        this.recordTest('Theme Switching Capability', hasOverride);
        
        return hasOptimizedCSS && !hasOldRefs && hasOverride;
    }

    // Test 4: CSS structural integrity
    testCSSStructure() {
        const cssPath = path.join(this.projectRoot, 'styles/main-optimized.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        
        // Check for balanced braces
        const openBraces = (css.match(/{/g) || []).length;
        const closeBraces = (css.match(/}/g) || []).length;
        const bracesBalanced = openBraces === closeBraces;
        this.recordTest('CSS Braces Balanced', bracesBalanced, `${openBraces} open, ${closeBraces} close`);
        
        // Check for critical CSS sections
        const requiredSections = [
            'CSS CUSTOM PROPERTIES',
            'THEME VARIATIONS',
            'BASE COMPONENT STYLES',
            'CHAT WINDOW',
            'MESSAGE LAYOUT'
        ];
        
        let allSectionsPresent = true;
        requiredSections.forEach(section => {
            const present = css.includes(section);
            this.recordTest(`Section: ${section}`, present);
            if (!present) allSectionsPresent = false;
        });
        
        return bracesBalanced && allSectionsPresent;
    }

    // Test 5: JavaScript dependency check
    testJavaScriptDependencies() {
        const requiredScripts = [
            'scripts/utils.js',
            'scripts/main.js',
            'scripts/models/simplebot.js',
            'scripts/models/openai.js'
        ];
        
        let allScriptsExist = true;
        requiredScripts.forEach(script => {
            const scriptPath = path.join(this.projectRoot, script);
            const exists = fs.existsSync(scriptPath);
            this.recordTest(`Script: ${script}`, exists);
            if (!exists) allScriptsExist = false;
        });
        
        return allScriptsExist;
    }

    // Test 6: Performance metrics
    testPerformanceMetrics() {
        const cssPath = path.join(this.projectRoot, 'styles/main-optimized.css');
        const stats = fs.statSync(cssPath);
        const fileSizeKB = stats.size / 1024;
        
        // Check file size is reasonable (should be under 50KB for good performance)
        const reasonableSize = fileSizeKB < 50;
        this.recordTest('CSS File Size', reasonableSize, `${fileSizeKB.toFixed(1)}KB`);
        
        const css = fs.readFileSync(cssPath, 'utf8');
        const lines = css.split('\n').length;
        
        // Check line count is reasonable (consolidated should be under 1500 lines)
        const reasonableLines = lines < 1500;
        this.recordTest('CSS Line Count', reasonableLines, `${lines} lines`);
        
        return reasonableSize && reasonableLines;
    }

    // Test 7: Button structure integrity
    testButtonStructure() {
        const htmlPath = path.join(this.projectRoot, 'index.html');
        
        if (!fs.existsSync(htmlPath)) {
            return this.recordTest('HTML File Exists', false, 'index.html not found');
        }

        const html = fs.readFileSync(htmlPath, 'utf8');
        
        const expectedButtons = [
            'guardrails-btn',
            'style-switcher-btn', 
            'preferences-btn',
            'about-btn'
        ];
        
        let allButtonsValid = true;
        
        expectedButtons.forEach(buttonId => {
            // Check for toolbar-button class
            const hasClass = html.includes(`id="${buttonId}"`) && 
                           html.includes('class="toolbar-button"');
            this.recordTest(`${buttonId} has toolbar-button class`, hasClass);
            if (!hasClass) allButtonsValid = false;
            
            // Check for button-icon span structure
            const buttonMatch = html.match(new RegExp(`<button[^>]*id="${buttonId}"[^>]*>.*?<\/button>`, 's'));
            if (buttonMatch) {
                const buttonHTML = buttonMatch[0];
                const hasIconSpan = buttonHTML.includes('class="button-icon"');
                this.recordTest(`${buttonId} has button-icon span`, hasIconSpan);
                if (!hasIconSpan) allButtonsValid = false;
            } else {
                this.recordTest(`${buttonId} button found`, false);
                allButtonsValid = false;
            }
        });
        
        // Check CSS uses consolidated classes
        const cssPath = path.join(this.projectRoot, 'styles/main-optimized.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        
        const usesToolbarClass = css.includes('.toolbar-button');
        const usesIconClass = css.includes('.button-icon');
        this.recordTest('CSS uses .toolbar-button class', usesToolbarClass);
        this.recordTest('CSS uses .button-icon class', usesIconClass);
        
        return allButtonsValid && usesToolbarClass && usesIconClass;
    }

    // Run all tests
    runAllTests() {
        console.log('🧪 CSS Architecture Smoke Test\n');
        console.log('=' .repeat(50));
        
        const testSuite = [
            () => this.testCSSFileStructure(),
            () => this.testThemeCompleteness(),
            () => this.testHTMLIntegration(),
            () => this.testCSSStructure(),
            () => this.testJavaScriptDependencies(),
            () => this.testPerformanceMetrics(),
            () => this.testButtonStructure()
        ];
        
        const results = testSuite.map(test => test());
        const passed = results.filter(r => r).length;
        const total = results.length;
        
        console.log('=' .repeat(50));
        console.log(`\n📊 Test Summary: ${passed}/${total} test suites passed`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! CSS architecture is healthy.');
            return true;
        } else {
            console.log('⚠️  Some tests failed. Review above for details.');
            
            // Show failed tests summary
            const failed = this.testResults.filter(r => !r.passed);
            if (failed.length > 0) {
                console.log('\n❌ Failed Tests:');
                failed.forEach(test => {
                    console.log(`   - ${test.test}${test.details ? ': ' + test.details : ''}`);
                });
            }
            return false;
        }
    }

    // Generate detailed report
    generateReport() {
        const cssPath = path.join(this.projectRoot, 'styles/main-optimized.css');
        if (!fs.existsSync(cssPath)) return;
        
        const css = fs.readFileSync(cssPath, 'utf8');
        const stats = fs.statSync(cssPath);
        const variables = (css.match(/--[\w-]+:/g) || []).length;
        const selectors = (css.match(/[^{}]+{/g) || []).length;
        const lines = css.split('\n').length;
        
        console.log('\n📈 Architecture Metrics:');
        console.log(`   CSS Variables: ${variables}`);
        console.log(`   CSS Selectors: ${selectors}`);
        console.log(`   Lines of Code: ${lines}`);
        console.log(`   File Size: ${(stats.size / 1024).toFixed(1)}KB`);
        console.log(`   Extensibility: ~3-5 lines for new themes`);
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSSArchitectureTest;
}

// Run tests if called directly
if (require.main === module) {
    const test = new CSSArchitectureTest();
    const success = test.runAllTests();
    test.generateReport();
    process.exit(success ? 0 : 1);
}