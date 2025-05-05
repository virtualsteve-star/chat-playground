# Steve's Chat Playground

A companion project to [The Developer's Playbook for Large Language Model Security](https://www.amazon.com/Developers-Playbook-Large-Language-Security/dp/109816220X), this open-source HTML/JavaScript application provides a hands-on environment for experimenting with various chat models, personalities, guardrails and user interfaces locally, quickly and with zero connectivity or cost. 

**▶️ [Watch the Demo Video](https://youtu.be/3lPvKyifFMI)**

With the rapid evolution of LLM and Generative AI technology (new models, techniques, agents, etc.), it's become increasingly challenging for developers to find a practical starting point for hands-on experimentation. This playground addresses that need by offering:

- **Multiple Models**: From simple local pattern-matching to OpenAI's powerful models
- **Different Views**: Various UI styles to understand how different interfaces affect user experience
- **Guardrails**: Both simple local filters and advanced AI-powered content moderation
- **Zero Dependencies**: Everything runs in the browser, making it easy to get started

Features a zero-dependency SimpleBot model and simple keyword-based gaurdrails for rapid prototyping and testing of chat experiences without external API costs, perfect for understanding the fundamental security properties of LLM interactions.

## Try It Out!

The chat playground is live at: [https://virtualsteve-star.github.io/chat-playground/](https://virtualsteve-star.github.io/chat-playground/)

Try different personalities and visual styles directly in your browser - no installation required! The playground offers two tiers of functionality:

1. **Local Experience (No API Key Required):**
   - SimpleBot personalities with local pattern matching
   - Basic blocklist-based guardrails
   - All visual styles and UI features
   - Perfect for understanding fundamental concepts

2. **Full Experience (API Key Required):**
   - OpenAI-powered personalities using ChatGPT 4o-mini
   - Advanced AI-powered content moderation
   - All local features plus smarter responses
   - Great for exploring more sophisticated interactions

For the full experience including OpenAI-powered personalities and advanced guardrails, you'll need to clone and run locally with your API key.

## Features

- Clean, intuitive chat interface
- Support for streaming token responses
- Multiple visual styles (Vanilla, Green Screen, iMessage, iMessage Dark)
- Local testing with SimpleBot (based on ELIZA-style pattern matching)
  - Zero external dependencies
  - Instant response times
  - Easily create new personalities with simple text files
  - Perfect for UI/UX testing and prototyping
- Remote model support (OpenAI ChatGPT 4o-mini)
- Thumbs up/down feedback for responses
- **Guardrails (Input & Output Filters):** Blocklist-based filtering for both user input and model output, with a visual panel for managing filters


## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenAI API key (for the ChatGPT 4o-mini model)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/virtualsteve-star/chat-playground.git
   cd chat-playground
   ```

2. Open `index.html` in your web browser or serve it using a simple HTTP server:
   ```
   python3 -m http.server
   ```
   Then visit http://localhost:8000 in your browser.

3. For the OpenAI model, you'll be prompted to enter your API key when you first select a personality that uses the ChatGPT 4o-mini model.

## Usage

1. Select a personality from the dropdown menu.
2. Type your message in the input field and press Enter or click Send.
3. Use the style selector to switch between different visual themes.
4. Provide feedback on responses using the thumbs up/down buttons.

## Project Structure

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
│   ├── filters/            # Guardrails/filter logic
│   │   └── blocklist.js    # Blocklist filter implementation
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
│   ├── researcher_prompt.txt     # OpenAI researcher prompt
│   └── angry_prompt.txt          # Angry bot script
├── filters/                # Blocklist files for guardrails
│   ├── sex_blocklist.txt        # Sexual content blocklist
│   └── violence_blocklist.txt   # Violence content blocklist
└── assets/                 # Application assets
    └── graphics/           # Image assets including feedback icons
```

## Current Personalities

- **Eliza (Psychoanalyst)**: A classic psychotherapist chatbot using the SimpleBot model
- **Bob (Tech Support)**: A helpful tech support assistant using ChatGPT 4o-mini
- **Jackson (Banker)**: A banking assistant using the SimpleBot model
- **Sally (Researcher)**: A knowledge-focused research assistant using ChatGPT 4o-mini
- **Oscar (Jailbroken)**: A test personality using SimpleBot that demonstrates the importance of guardrails by intentionally using inappropriate language

## Adding New Models

To add a new chat model:

1. Create a new JavaScript file in the `scripts/models/` directory.
2. Implement the required interface:
   ```javascript
   class NewModel {
       async initialize(resourcePath) { ... }
       async generateResponse(userMessage, context) { ... }
       cancel() { ... }
   }
   ```
3. Add the model to `config/models.properties`.

## Adding New Personalities

To add a new personality:

1. Create a resource file in the `personalities/` directory:
   - For SimpleBot personalities: Create a text file with pattern matching rules
   - For ChatGPT personalities: Create a text file with the system prompt
   - Example: `personalities/my_new_personality.txt`

2. Add the personality to `config/personalities.properties`:
   ```
   PersonalityName (Role)=ModelName,personalities/my_new_personality.txt
   ```
   Example:
   ```
   Alice (Travel Agent)=SimpleBot,personalities/travel_agent.txt
   Dave (Data Scientist)=ChatGPT 4o-mini,personalities/data_scientist.txt
   ```

3. Choose the appropriate model:
   - Use `SimpleBot` for simple, scripted interactions that don't need AI
   - Use `ChatGPT 4o-mini` for complex, AI-driven interactions

4. Test your personality:
   - Restart the application or refresh the page
   - Your new personality should appear in the dropdown
   - Test with various inputs to ensure proper responses

## Adding New Visual Styles

To add a new visual style:

1. Create a new CSS file in the `styles/` directory:
   - Name it descriptively: `styles/my_new_style.css`
   - Include all necessary styling for:
     - Chat container
     - Message bubbles (user and bot)
     - Input area
     - Buttons and controls
     - Any custom elements

2. Add the style to `config/styles.properties`:
   ```
   My New Style=styles/my_new_style.css
   ```
   Example:
   ```
   Matrix Theme=styles/matrix.css
   Retro Console=styles/retro.css
   ```

3. Update the style selector in `index.html`:
   ```html
   <select id="style-selector">
       <option value="vanilla">Vanilla</option>
       <option value="green-screen">Green Screen</option>
       <option value="imessage">iMessage</option>
       <option value="imessage-dark">iMessage Dark</option>
       <option value="my-new-style">My New Style</option>
   </select>
   ```

4. Add any necessary assets:
   - Place images in `assets/graphics/`
   - Place fonts in `assets/fonts/` (create directory if needed)
   - Reference assets using relative paths in your CSS

5. Test your style:
   - Ensure it works with all message types
   - Test with long messages and special characters
   - Verify proper line break handling
   - Check responsive design on different screen sizes

## Line Break Handling

Chat messages properly preserve line breaks and formatting across all visual styles through the use of:
- `white-space: pre-wrap` CSS property
- HTML conversion of newlines to `<br>` tags

## Guardrails (Input & Output Filters)

Guardrails help ensure a safe and appropriate chat experience by blocking messages containing certain terms. The system supports both **Input Filters** (blocking user prompts) and **Output Filters** (blocking model responses) using configurable blocklists.

- **Guardrails Panel:**
  - Click the "Guardrails" button to open a right-side panel.
  - Use the tree structure to enable/disable specific input and output filters (e.g., Sex, Violence).
  - Filters are applied in real time to both user and model messages.
- **Polite Rejection:**
  - If a message is blocked, a polite rejection message is shown, specifying the type of content (e.g., "sexual content").
- **Visual Consistency:**
  - The Guardrails panel and controls are styled to match the current visual theme, including green-screen mode.

## Adding New Guardrails

You can add new blocklist-based guardrails to filter additional types of content. The process is similar to adding new personalities or visual styles:

1. **Create a Blocklist File:**
   - Add a new text file in the `filters/` directory (e.g., `filters/hate_blocklist.txt`).
   - List one term per line. Lines starting with `#` are treated as comments.
   - Example:
     ```
     # Hate Speech Blocklist
     hate
     racist
     slur
     bigot
     ...
     ```
2. **Register the Blocklist in Code:**
   - Edit `scripts/filters/blocklist.js`.
   - In the `BlocklistFilter` constructor and `initialize()` method, add your new blocklist (see existing `sex` and `violence` for reference).
   - Example:
     ```js
     this.blocklists = {
         sex: [],
         violence: [],
         hate: [] // Add your new filter here
     };
     // In initialize():
     const hateResponse = await fetch('filters/hate_blocklist.txt');
     const hateText = await hateResponse.text();
     this.blocklists.hate = hateText.split('\n')
         .filter(line => line.trim() && !line.startsWith('#'))
         .map(term => term.toLowerCase().trim());
     ```
   - Add a user-friendly name in `getRejectionMessage()` if needed.
3. **Update the Guardrails UI:**
   - The new filter will automatically appear in the Guardrails panel if registered in the blocklist filter.
   - Test by enabling the filter and sending a message containing a blocked term.

## OpenAI API Key Management

The chat playground requires an OpenAI API key to use the GPT-based, advanced personalities and advanced content moderation features. Here's how the API key is handled:

- **When You Need It:**
  - You'll be prompted to enter your API key when you first select a personality that uses an Open AI GPT model
  - The key is also required for OpenAI-powered content moderation filters
  - You can use SimpleBot and Blocklist guardrails without Open AI keys

- **Storage & Security:**
  - The API key is stored **only on your local machine** in the browser's localStorage
  - The key is never transmitted to any server except OpenAI's API
  - The key is encrypted before storage using a simple encryption method
  - You can verify this by checking that the key is only used in direct API calls to OpenAI

- **Managing Your Key:**
  - To add a key: Click the "Prefs" button and use the "Add Key" button in the Preferences panel
  - To clear your key: Click the "Prefs" button and use the "Clear Key" button
  - Clearing the key removes it from:
    - localStorage
    - In-memory cache
    - Current model instance
  - You'll need to enter a new key when you next use a ChatGPT personality

- **Privacy & Security:**
  - Your API key is never stored on any server
  - The key is only used for direct API calls to OpenAI
  - You can clear your key at any time to ensure it's completely removed
  - The application runs entirely in your browser, so your key never leaves your machine

## Contact

You can reach Steve Wilson, the project creator, on [LinkedIn](https://www.linkedin.com/in/wilsonsd/). Steve is a cybersecurity and AI expert who writes frequently about AI safety, security, and development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original ELIZA program by Joseph Weizenbaum
- OpenAI for providing the ChatGPT API 