# Specification: Steve's Chat Playground

## Overview
Steve's Chat Playground is an open-source HTML/JavaScript application allowing users to experiment with various chat models, personalities, and user interfaces locally. The application must be simple, modular, and highly extensible to easily accommodate additional models, personalities, and integration with external services and protocols.

## User-visible functionality

### Chat Window
- A clean, intuitive chat interface allowing users to type messages and view model responses.
- Supports streaming token responses where possible for real-time interaction.
- Includes a dropdown picker for selecting the active chat personality.
- Standard chat controls:
  - "Thumbs up/down" feedback buttons for rating responses.
- UI indicator such as a "working..." message to clearly signal when a model is processing a response.

### Visual Picker
- Dropdown or toggle to switch between visual styles:
  1. **Vanilla:** Standard minimalist interface.
  2. **Old-school Green Screen:** Terminal-style green-on-black interface.
  3. **Modern iMessage:** Contemporary messaging UI with chat bubbles and modern aesthetics.

## Chat Personalities
- Personalities combine a backend model (local or remote) with associated functionality or resource files (e.g., dialogue scripts or system prompts).
- Initial examples:
  - **Simple Psychoanalyst:** ELIZA model with psychotherapist script file.
  - **Advanced Tech Support:** ChatGPT 4o-mini model with custom system prompt file.
- Easy to extend by editing a properties file and providing additional scripts or prompts.

## Chat Model Implementations

Clearly separate local and remote chat model implementations. Initial examples include ELIZA (local) and OpenAI ChatGPT 4o-mini (remote). Structure must easily support adding new local or remote models, such as alternative rule-based systems or cloud-based models (e.g., Claude, Grok).

### Local Model Example: ELIZA
- Loads dialogue responses from local text files.
- Runs entirely in-browser for free, local testing.

### Remote Model Example: OpenAI ChatGPT 4o-mini
- Connects to OpenAI's API (ChatGPT 4o-mini).
- Allows users to securely enter and store their OpenAI API key locally (e.g., browser localStorage).

## Technical Structure & Extensibility

### File and Directory Structure
```
steves-chat-playground/
├── index.html
├── styles/
│   ├── vanilla.css
│   ├── green-screen.css
│   └── imessage.css
├── scripts/
│   ├── main.js
│   ├── models/
│   │   ├── eliza.js
│   │   └── openai.js
│   └── utils.js
├── config/
│   ├── models.properties
│   ├── styles.properties
│   └── personalities.properties
└── personalities/
    ├── psychotherapist.txt
    └── tech_support_prompt.txt
```

### Properties File Format
- **models.properties:** Lists available models and associated JS file references.
```
Eliza=models/eliza.js
ChatGPT 4o-mini=models/openai.js
```
- **styles.properties:** Lists available visual styles and associated CSS file references.
```
Vanilla=styles/vanilla.css
Green Screen=styles/green-screen.css
Modern iMessage=styles/imessage.css
```
- **personalities.properties:** Lists available personalities, their associated models, and resource files.
```
Simple Psychoanalyst=Eliza,personalities/psychotherapist.txt
Advanced Tech Support=ChatGPT 4o-mini,personalities/tech_support_prompt.txt
```

### Model Interface Requirements

All model implementations (local or remote) must expose the following async interface:

```js
async function generateResponse(userMessage, context) => string | Stream<string>
```

- `userMessage`: string input from the user
- `context`: optional metadata or prior messages (for advanced models)
- Must return either:
  - a full string response, or
  - a stream-like interface for streaming tokens

**Optional but recommended:**
- Support a `cancel()` method to allow the UI to interrupt long-running or streaming responses.

### Implementation Notes
- Modular JavaScript architecture simplifies the addition of new local or remote models, personalities, and visual themes.
- Clear separation between UI, application logic, personality configuration, and model implementations.
- Standard web technologies (HTML5, CSS3, JavaScript ES6).
- Compliance with browser security standards and best practices for local data handling.

## Future Expansion
- Plan for integration with MCP-based tooling (Model Context Protocol), ensuring architectural flexibility and easy adoption of MCP functionalities.
- Consideration for future support of third-party integrations and plugin architectures.

## Open Source Contribution Guidelines
- Provide a detailed README.md outlining setup, configuration, and instructions for adding new models, personalities, or visual styles.
- Clearly document code to facilitate community contributions.
- Utilize GitHub for repository hosting, issue tracking, and managing pull requests.
