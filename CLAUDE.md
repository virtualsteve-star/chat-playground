# Chat Playground - Claude Rules

## High Level Overview
This is an educational web application for experimenting with LLM security, guardrails, and chatbot personalities. It's meant to be a companion to "The Developer's Playbook for Large Language Model Security" and the OWASP Top 10 for LLM Applications. 

The app has two main modes:
1. SimpleBot (local pattern-matching, no API required) - for basic testing and prototyping
2. OpenAI-powered personalities (requires API key) - for more sophisticated interactions

The purpose is educational and experimentation - it intentionally includes vulnerable personalities and backdoors for security research.

## Tech Stack
- Vanilla HTML/CSS/JavaScript (no frameworks)
- Zero external dependencies for local functionality
- Optional OpenAI API integration for advanced features
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
- Test both SimpleBot and OpenAI modes when making changes
- Document any new personalities or guardrails clearly

## Recent Major Changes
- CSS architecture consolidated from 4 files to single variable-driven system (June 2025)
- New themes require only CSS variable overrides, not full stylesheet duplication
- Run `node tests/CSSArchitectureTest.js` after any styling changes

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