# Specification: Steve's Chat Playground

## Overview
Steve's Chat Playground is an open-source HTML/JavaScript application allowing users to experiment with various chat models, personalities, and user interfaces locally. The application must be simple, modular, and highly extensible to easily accommodate additional models, personalities, and integration with external services and protocols. A key feature is the ability to test chat experiences locally without any external API dependencies using the SimpleBot model.

## User-visible functionality

### Chat Window
- A clean, intuitive chat interface allowing users to type messages and view model responses.
- Supports streaming token responses where possible for real-time interaction.
- Includes a dropdown picker for selecting the active chat personality.
- Standard chat controls:
  - "Thumbs up/down" feedback buttons for rating responses.
- UI indicator such as a "working..." message to clearly signal when a model is processing a response.
- Proper handling of line breaks and formatting across all visual styles.

### Visual Picker
- Dropdown or toggle to switch between visual styles:
  1. **Vanilla:** Standard minimalist interface.
  2. **Green Screen:** Terminal-style green-on-black interface.
  3. **iMessage:** Contemporary messaging UI with chat bubbles.
  4. **iMessage Dark:** Dark mode variant of the iMessage theme.

## Chat Personalities
- Personalities combine a backend model (local or remote) with associated functionality or resource files (e.g., dialogue scripts or system prompts).
- Current personalities:
  - **Eliza (Psychoanalyst)**: A classic psychotherapist chatbot using the SimpleBot model
  - **Bob (Tech Support)**: A helpful tech support assistant using ChatGPT 4o-mini
  - **Jackson (Banker)**: A banking assistant using the SimpleBot model
  - **Sally (Researcher)**: A knowledge-focused research assistant using ChatGPT 4o-mini
- Easy to extend by editing a properties file and providing additional scripts or prompts.

## Chat Model Implementations

Clearly separate local and remote chat model implementations. Current implementations include SimpleBot (local) and OpenAI ChatGPT 4o-mini (remote). Structure must easily support adding new local or remote models, such as alternative rule-based systems or cloud-based models.

### Local Model Example: SimpleBot
- A generic, modern implementation of the classic ELIZA-style pattern matching chatbot
- Designed for rapid prototyping and testing of chat experiences with zero external dependencies
- Loads dialogue responses from local text files, making it easy to create new personalities
- Runs entirely in-browser for free, instant local testing
- Perfect for testing UI changes, new features, or chat flow concepts without API costs
- Used for basic scripted interactions like psychotherapy and banking
- Can be extended with new personality scripts to simulate different types of conversations

### Remote Model Example: OpenAI ChatGPT 4o-mini
- Connects to OpenAI's API (ChatGPT 4o-mini).
- Allows users to securely enter and store their OpenAI API key locally (e.g., browser localStorage).
- Used for more complex, AI-driven interactions like tech support and research.

## Technical Structure & Extensibility

### File and Directory Structure
```
steves-chat-playground/
├── index.html              # Main HTML file
├── styles/                 # CSS styles
│   ├── vanilla.css         # Default minimalist style
│   ├── green-screen.css    # Terminal-style interface
│   ├── imessage.css        # Modern messaging UI
│   └── imessage-dark.css   # Dark mode for iMessage UI
├── scripts/                # JavaScript files
│   ├── main.js             # Main application logic
│   ├── utils.js            # Utility functions
│   └── models/             # Chat model implementations
│       ├── simplebot.js    # SimpleBot local model
│       └── openai.js       # OpenAI remote model
├── config/                 # Configuration files
│   ├── models.properties   # Model configurations
│   ├── styles.properties   # Style configurations
│   └── personalities.properties  # Personality configurations
├── personalities/          # Personality resources
│   ├── psychotherapist.txt       # SimpleBot psychotherapist script
│   ├── tech_support_prompt.txt   # OpenAI tech support prompt
│   ├── banker_prompt.txt         # SimpleBot banker script
│   └── researcher_prompt.txt     # OpenAI researcher prompt
└── assets/                 # Application assets
    └── graphics/           # Image assets including feedback icons
```

### Properties File Format
- **models.properties:** Lists available models and associated JS file references.
```
SimpleBot=models/simplebot.js
ChatGPT 4o-mini=models/openai.js
```
- **styles.properties:** Lists available visual styles and associated CSS file references.
```
Vanilla=styles/vanilla.css
Green Screen=styles/green-screen.css
iMessage=styles/imessage.css
iMessage Dark=styles/imessage-dark.css
```
- **personalities.properties:** Lists available personalities, their associated models, and resource files.
```
Eliza (Psychoanalyst)=SimpleBot,personalities/psychotherapist.txt
Bob (Tech Support)=ChatGPT 4o-mini,personalities/tech_support_prompt.txt
Jackson (Banker)=SimpleBot,personalities/banker_prompt.txt
Sally (Researcher)=ChatGPT 4o-mini,personalities/researcher_prompt.txt
```

### Model Interface Requirements

All model implementations (local or remote) must expose the following async interface:

```js
class Model {
    async initialize(resourcePath) { ... }
    async generateResponse(userMessage, context) { ... }
    cancel() { ... }
}
```

- `initialize`: Loads and sets up any required resources
- `generateResponse`: Processes user input and returns a response
  - `userMessage`: string input from the user
  - `context`: optional metadata or prior messages (for advanced models)
  - Must return either:
    - a full string response, or
    - a stream-like interface for streaming tokens
- `cancel`: Optional method to interrupt long-running or streaming responses

### Implementation Notes
- Modular JavaScript architecture simplifies the addition of new local or remote models, personalities, and visual themes.
- Clear separation between UI, application logic, personality configuration, and model implementations.
- Standard web technologies (HTML5, CSS3, JavaScript ES6).
- Compliance with browser security standards and best practices for local data handling.
- Proper line break handling using CSS white-space and HTML conversion.

## Future Expansion
- Plan for integration with MCP-based tooling (Model Context Protocol), ensuring architectural flexibility and easy adoption of MCP functionalities.
- Consideration for future support of third-party integrations and plugin architectures.

## Open Source Contribution Guidelines
- Provide a detailed README.md outlining setup, configuration, and instructions for adding new models, personalities, or visual styles.
- Clearly document code to facilitate community contributions.
- Utilize GitHub for repository hosting, issue tracking, and managing pull requests.
