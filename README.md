# Steve's Chat Playground

An open-source HTML/JavaScript application allowing users to experiment with various chat models, personalities, and user interfaces locally.

## Features

- Clean, intuitive chat interface
- Support for streaming token responses
- Multiple visual styles (Vanilla, Green Screen, Modern iMessage)
- Configurable chat personalities
- Local and remote model implementations
- Thumbs up/down feedback for responses

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenAI API key (for the ChatGPT 4o-mini model)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/steves-chat-playground.git
   cd steves-chat-playground
   ```

2. Open `index.html` in your web browser.

3. For the OpenAI model, you'll be prompted to enter your API key when you first select the "Advanced Tech Support" personality.

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
│   └── imessage.css        # Modern messaging UI
├── scripts/                # JavaScript files
│   ├── main.js             # Main application logic
│   ├── utils.js            # Utility functions
│   └── models/             # Chat model implementations
│       ├── eliza.js        # ELIZA local model
│       └── openai.js       # OpenAI remote model
├── config/                 # Configuration files
│   ├── models.properties   # Model configurations
│   ├── styles.properties   # Style configurations
│   └── personalities.properties  # Personality configurations
└── personalities/          # Personality resources
    ├── psychotherapist.txt # ELIZA psychotherapist script
    └── tech_support_prompt.txt  # OpenAI tech support prompt
```

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

1. Create a resource file in the `personalities/` directory.
2. Add the personality to `config/personalities.properties`:
   ```
   PersonalityName=ModelName,personalities/resource.txt
   ```

## Adding New Visual Styles

To add a new visual style:

1. Create a CSS file in the `styles/` directory.
2. Add the style to `config/styles.properties`:
   ```
   StyleName=styles/style.css
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original ELIZA program by Joseph Weizenbaum
- OpenAI for providing the ChatGPT API 