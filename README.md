# Steve's Chat Playground

A browser-based playground for experimenting with chatbots, personalities, guardrails, and visual styles—all running locally in your browser. No server required!

## What You Can Do

- **Chat with Multiple Personalities:**
  - Classic ELIZA-style bots
  - OpenAI-powered assistants (with your API key)
  - Tech support, researcher, banker, and more
- **Switch Visual Styles Instantly:**
  - Minimalist Vanilla
  - Retro Green Screen (terminal)
  - iMessage (light and dark)
- **Try Guardrails:**
  - Blocklist-based and AI-powered moderation
  - Enable/disable input and output filters in real time
- **No Install, No Server:**
  - Everything runs in your browser
  - Your API key (if used) is stored only on your device

## Included Personalities
- Eliza (Psychoanalyst)
- Bob (Tech Support, GPT)
- Jackson (Banker)
- Sally (Researcher, GPT)
- Oscar (Jailbroken SimpleBot)

## Visual Styles
- Vanilla (clean, modern)
- Green Screen (terminal/retro)
- iMessage (light)
- iMessage (dark)

## Guardrails
- Blocklist filters: Sex, Violence
- OpenAI Moderation filters: Sex, Violence (input/output)

## How to Use
1. Open `index.html` in your browser (or run with a simple HTTP server)
2. Select a personality and style
3. Start chatting!
4. (Optional) Add your OpenAI API key in Preferences for GPT-powered bots and moderation

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
│   ├── psychotherapist.txt       # SimpleBot psychotherapist script
│   ├── tech_support_prompt.txt   # OpenAI tech support prompt
│   ├── banker_prompt.txt         # SimpleBot banker script
│   ├── researcher_prompt.txt     # OpenAI researcher prompt
│   └── angry_bot.txt             # Angry bot script
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