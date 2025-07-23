# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Chat Playground - Claude Rules

## High Level Overview
This is an educational web application for experimenting with LLM security, guardrails, and chatbot personalities. It's meant to be a companion to "The Developer's Playbook for Large Language Model Security" and the OWASP Top 10 for LLM Applications. 

The app has three main modes:
1. SimpleBot (local pattern-matching, no API required) - for basic testing and prototyping
2. OpenAI-powered personalities (requires API key) - for sophisticated GPT interactions
3. Gemini-powered personalities (requires API key) - for Google's AI model interactions

The purpose is educational and experimentation - it intentionally includes vulnerable personalities and backdoors for security research.

## Tech Stack
- Vanilla HTML/CSS/JavaScript (no frameworks)
- Zero external dependencies for local functionality
- Optional API integrations for advanced features (OpenAI, Google Gemini)
- All code runs in the browser

## Key Architecture Principles
- Zero dependencies for core functionality 
- Everything should work offline for SimpleBot mode
- Security is intentionally configurable/breakable for educational purposes
- Clean separation between local and API-powered features
- Simple, readable code for educational value

## Development Guidelines
- Keep it simple - this is meant to be easily understood
- Preserve the educational nature - don't over-engineer
- Maintain backward compatibility 
- Test SimpleBot, OpenAI, and Gemini modes when making changes
- Document any new personalities or guardrails clearly

## Development Commands

### Running the Application
```bash
# Serve locally (no build process required)
python3 -m http.server
# Then navigate to http://localhost:8000

# Alternative servers:
npx http-server  # if Node.js is available
php -S localhost:8000  # if PHP is available
```

### Running Tests
```bash
# Browser-based test suite
python3 -m http.server
# Navigate to http://localhost:8000/tests/index.html

# SimpleBot smoke test (URL parameter)
# http://localhost:8000?test-local

# Individual test categories:
# http://localhost:8000/tests/PromptInjectTest.html
# http://localhost:8000/tests/SexualContentTest.html
# http://localhost:8000/tests/ViolenceContentTest.html
# http://localhost:8000/tests/CodeGenerationTest.html
```

### Note on CSS Architecture Test
The file `tests/CSSArchitectureTest.js` is referenced but does not exist. This appears to be planned functionality.

## Code Architecture

### Directory Structure
```
├── index.html                  # Main application entry point
├── scripts/
│   ├── core/                   # API key management
│   ├── filters/                # Guardrail implementations
│   ├── models/                 # Model implementations
│   ├── main.js                 # Main application logic
│   └── simplebot.js           # Local pattern-matching bot
├── config/
│   ├── models.properties       # Model configurations
│   ├── personalities.properties # Personality definitions
│   └── styles.properties       # UI style configurations
├── personalities/              # Text files with personality prompts
├── styles/
│   └── main-optimized.css     # Consolidated CSS (variable-driven)
└── tests/                     # Browser-based test suite
```

### Key Architectural Components

1. **Model System** (`scripts/models/`)
   - Base class: `BaseModel` - defines common interface
   - Implementations: `SimpleBot`, `OpenAI`
   - Models are registered in `config/models.properties`

2. **Filter System** (`scripts/filters/`)
   - Base class: `BaseFilter` - defines common interface
   - Local filters: Pattern matching, rate limiting, length checks
   - API filters: OpenAI moderation, AI-powered injection detection
   - Filters can be chained and toggled via UI

3. **Personality System**
   - Defined in `config/personalities.properties`
   - Prompts stored in `personalities/*.txt`
   - Some personalities intentionally include vulnerabilities for testing

4. **API Key Management** (`scripts/core/apiKeyManager.js`)
   - Secure browser-based storage (never sent to external servers)
   - Supports both session and persistent storage
   - Handles validation and error cases

5. **UI Architecture**
   - All styling via CSS variables in `main-optimized.css`
   - Multiple themes selectable via dropdown
   - Responsive design with mobile support

## Recent Major Changes
- CSS architecture consolidated from 4 files to single variable-driven system (June 2025)
- New themes require only CSS variable overrides, not full stylesheet duplication
- Run `node tests/CSSArchitectureTest.js` after any styling changes (Note: file currently missing)

## Critical UI Architecture Rules

### Toolbar Button Structure (NEVER BREAK)
All toolbar buttons MUST follow this exact structure:
```html
<button id="your-btn" class="toolbar-button" title="Your Title">
    <span class="button-icon">emoji</span>
</button>
```

**JavaScript Guidelines:**
- ✅ **GOOD**: `button.querySelector('.button-icon').textContent = 'newEmoji';`
- ❌ **NEVER**: `button.textContent = 'newEmoji';` (destroys DOM structure)

**Why this matters**: JavaScript that modifies button structure breaks CSS targeting, making buttons unstyled and inconsistent. This caused a major debugging session that could have been avoided.

### CSS Architecture
- Use CSS custom properties (variables) for all theming
- Never use `!important` declarations
- All toolbar buttons automatically inherit consistent sizing via `.toolbar-button` class
- Button structure validation is included in automated tests

## Adding New Features

### New Personality
1. Add entry to `config/personalities.properties`
2. Create prompt file in `personalities/` directory
3. Test with SimpleBot, OpenAI, and Gemini models as appropriate

### New Filter/Guardrail
1. Create new class extending `BaseFilter` in `scripts/filters/`
2. Register in appropriate location (local vs API-powered)
3. Add test cases to relevant test files
4. Document in `documentation/guardrails.md`

### New Visual Style
1. Add style definition to `config/styles.properties`
2. Override CSS variables in `styles/main-optimized.css`
3. Test across different screen sizes and personalities

## Testing Guidelines
- Always test new features with SimpleBot, OpenAI, and Gemini models
- Add test cases for new personalities or filters
- Verify mobile responsiveness for UI changes
- Check that intentional vulnerabilities remain functional (for educational purposes)
- Run the full test suite before significant changes