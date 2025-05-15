# Models

In Steve's Chat Playground, a **model** is the underlying engine that generates responses to user prompts. Models define the core logic, capabilities, and limitations of the chatbot. Each personality in the playground is powered by a specific model, which determines how it interprets input and produces output.

## Available Models

### SimpleBot
- **Type:** Local, pattern-matching
- **File:** `scripts/models/simplebot.js`
- **Description:**
  - SimpleBot is a zero-dependency, local model inspired by classic ELIZA-style pattern matching. It uses a set of rules and scripts to generate responses based on user input.
  - It does not require an internet connection or API key, making it ideal for rapid prototyping, UI/UX testing, and understanding basic chatbot logic.
  - SimpleBot is fast, lightweight, and can be easily extended with new scripts or personalities.
  - **Limitations:** No true understanding or reasoning; responses are based on pattern matching and script rules only.

### OpenAI (ChatGPT 4o-mini)
- **Type:** Remote, API-based (OpenAI)
- **File:** `scripts/models/openai.js`
- **Description:**
  - This model connects to OpenAI's ChatGPT 4o-mini via API, providing advanced natural language understanding and generation capabilities.
  - It supports more sophisticated, context-aware conversations and can handle a wider range of topics and instructions.
  - Requires an OpenAI API key and internet connectivity.
  - **Limitations:** Subject to OpenAI's usage policies, rate limits, and potential costs. Responses may vary based on OpenAI's model updates.

## How Models Are Configured

Models are defined in `config/models.properties`:

```
SimpleBot=scripts/models/simplebot.js
ChatGPT 4o-mini=scripts/models/openai.js
```

Each entry maps a model name to its implementation file. Personalities reference these model names to determine which engine powers their responses.

For instructions on adding new models, see [extensibility guide](extensibility.md).
For how models are used by personalities, see [personalities documentation](personalities.md). 