# Steve's Chat Playground

An open-source HTML/JavaScript application allowing users to experiment with various chat models, personalities, and user interfaces locally. Features a zero-dependency SimpleBot model for rapid prototyping and testing of chat experiences without external API costs.

## Try It Out!

The chat playground is live at: [https://virtualsteve-star.github.io/chat-playground/](https://virtualsteve-star.github.io/chat-playground/)

Try different personalities and visual styles directly in your browser - no installation required! For the full experience including OpenAI-powered personalities, you'll need to clone and run locally with your API key.

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

## Current Personalities

- **Eliza (Psychoanalyst)**: A classic psychotherapist chatbot using the SimpleBot model
- **Bob (Tech Support)**: A helpful tech support assistant using ChatGPT 4o-mini
- **Jackson (Banker)**: A banking assistant using the SimpleBot model
- **Sally (Researcher)**: A knowledge-focused research assistant using ChatGPT 4o-mini

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

## Contact

You can reach Steve Wilson, the project creator, on [LinkedIn](https://www.linkedin.com/in/wilsonsd/). Steve is a cybersecurity and AI expert who writes frequently about AI safety, security, and development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original ELIZA program by Joseph Weizenbaum
- OpenAI for providing the ChatGPT API 