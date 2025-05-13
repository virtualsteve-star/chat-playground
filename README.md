# Steve's Chat Playground

A companion project to [The Developer's Playbook for Large Language Model Security](https://www.amazon.com/Developers-Playbook-Large-Language-Security/dp/109816220X), this open-source HTML/JavaScript application provides a hands-on environment for experimenting with various chat models, personalities, guardrails and user interfaces locally, quickly and with zero connectivity or cost.

**▶️ [Watch the Demo Video](https://youtu.be/3lPvKyifFMI)**

With the rapid evolution of LLM and Generative AI technology (new models, techniques, agents, etc.), it's become increasingly challenging for developers to find a practical starting point for hands-on experimentation. This playground addresses that need by offering:

- **Multiple Models:** From simple local pattern-matching to OpenAI's powerful models.  Some models have vulnerabilities and back doors for testing and experimentation
- **Different Views:** Various UI styles to understand how different interfaces affect user experience
- **Guardrails:** Both simple local filters and advanced AI-powered content moderation
- **Zero Dependencies:** Everything runs in the browser, making it easy to get started

Features a zero-dependency SimpleBot model and simple keyword-based guardrails for rapid prototyping and testing of chat experiences without external API costs, perfect for understanding the fundamental security properties of LLM interactions.

## Try It Out!

The chat playground is live at: [https://virtualsteve-star.github.io/chat-playground/](https://virtualsteve-star.github.io/chat-playground/)

Try different personalities, guardrails and visual styles directly in your browser - no installation required! The playground offers two tiers of functionality:

### Local Experience (No API Key Required):
- SimpleBot personalities with local pattern matching
  - Includes Eliza (Psychoanalyst), Jackson (Banker), Oscar (Jailbroken), and Hopper (Backdoored Doctor)
- Basic blocklist-based guardrails
- All visual styles and UI features
- Perfect for understanding fundamental concepts

### Full Experience (API Key Required):
- OpenAI-powered personalities using real OpenAI models
- Advanced AI-powered content moderation and guardrails
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
- **Guardrails (Input & Output Filters):**
  - Local blocklist filters (e.g., Sex, Violence)
  - Heuristic/regex-based filters (e.g., Prompt Injection, Code)
  - AI-powered filters (OpenAI Moderation, OpenAI Nano Prompt Injection)
  - All filters are selectable in the Guardrails panel
  - Custom filters can be added (see EXTENSIBILITY.md)
- Multiple personalities:
  - Eliza (Psychoanalyst, SimpleBot)
  - Bob (Tech Support, GPT)
  - Jackson (Banker, SimpleBot)
  - Sally (Researcher, GPT)
  - Oscar (Jailbroken, SimpleBot)
  - Hopper (Backdoored, SimpleBot)
- Bot introduction logic improved: bots now introduce themselves more naturally based on their script or prompt
- SimpleBot logic and cache-busting improved for more reliable script updates

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
├── README.md               # Main documentation
├── EXTENSIBILITY.md        # Extensibility guide
├── VERSION_HISTORY.md      # Version history and release notes
├── LICENSE                 # License file
├── styles/                 # CSS styles
│   ├── vanilla.css         # Default minimalist style
│   ├── green-screen.css    # Terminal-style interface
│   ├── imessage.css        # Modern messaging UI
│   └── imessage-dark.css   # Dark mode for iMessage UI
├── scripts/                # JavaScript files
│   ├── main.js             # Main application logic
│   ├── terminal_ui.js      # Green Screen (terminal) UI logic
│   ├── utils.js            # Utility functions
│   ├── filters/            # Guardrails/filter logic
│   │   ├── blocklist.js         # Blocklist filter implementation
│   │   ├── code_output_filter.js # Heuristic code output filter (local)
│   │   ├── prompt_injection_filter.js # Heuristic prompt injection filter (local)
│   │   ├── openai_prompt_injection.js # OpenAI Nano prompt injection filter
│   │   ├── api_filter.js        # API filter base class
│   │   └── openai_moderation.js # OpenAI Moderation API filter
│   └── models/             # Chat model implementations
│       ├── simplebot.js    # SimpleBot local model
│       └── openai.js       # OpenAI remote model
├── config/                 # Configuration files
│   ├── models.properties   # Model configurations
│   ├── styles.properties   # Style configurations
│   └── personalities.properties  # Personality configurations
├── personalities/          # Personality resources
│   ├── therapist_rules.txt       # SimpleBot psychotherapist script
│   ├── tech_support_prompt.txt   # OpenAI tech support prompt
│   ├── banker_prompt.txt         # SimpleBot banker script
│   ├── researcher_prompt.txt     # OpenAI researcher prompt
│   ├── vuln_doctor_rules.txt     # SimpleBot backdoored doctor script (Hopper)
│   └── vuln_rude_rules.txt       # SimpleBot jailbroken/rude script (Oscar)
├── filters/                # Blocklist files for guardrails
│   ├── sex_blocklist.txt        # Sexual content blocklist
│   └── violence_blocklist.txt   # Violence content blocklist
├── assets/                 # Application assets
│   └── graphics/           # Image assets including feedback icons
├── tests/                  # Automated tests
│   ├── openai.test.js
│   ├── setup.js
│   ├── utils.test.js
│   ├── eliza.test.js
│   └── main.test.js
└── .gitignore, .DS_Store, etc.   # Miscellaneous and git files
```

## Want to Extend It?
- See [EXTENSIBILITY.md](EXTENSIBILITY.md) for how to add new personalities, styles, or guardrails.

## Version History
- See [VERSION_HISTORY.md](VERSION_HISTORY.md) for release notes and features.

---

Created by Steve Wilson. [LinkedIn](https://www.linkedin.com/in/wilsonsd/)
MIT License. 