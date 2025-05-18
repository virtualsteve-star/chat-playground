# Extending Steve's Chat Playground

This document explains how to extend the chat playground with new personalities, visual styles, and guardrails. Use this as a practical guide for customizing and expanding your own chat playground experience.

---

## 1. Personalities

**What are they?**
- Personalities define the chatbot's character, knowledge, and behavior.
- Can be powered by SimpleBot (local, pattern-matching) or OpenAI GPT (API-based).

**How it works:**
- Each personality is defined by a resource file (text prompt or script) and a model.
- Personalities are listed in `config/personalities.properties`.

**How to add a new personality:**
1. **Create a resource file:**
   - For SimpleBot: Write a text file with pattern/response rules.
   - For GPT: Write a text file with a system prompt.
   - Place it in the `personalities/` directory.
2. **Register in config:**
   - Add a line to `config/personalities.properties`:
     ```
     MyBot (Role)=ModelName,personalities/mybot.txt
     ```
   - Example:
     ```
     Alice (Travel Agent)=SimpleBot,personalities/travel_agent.txt
     Dave (Data Scientist)=ChatGPT 4o-mini,personalities/data_scientist.txt
     Hopper (Backdoored)=SimpleBot,personalities/vuln_doctor_rules.txt
     ```
3. **Test:**
   - Refresh the app. Your new personality should appear in the dropdown.

**Best practices:**
- Use clear, concise prompts for GPT personalities.
- For SimpleBot, follow the pattern/response format in existing scripts.

- For details on available personalities and how to configure or extend them, see [personalities documentation](personalities.md).

---

## 2. Visual Styles

**What are they?**
- Visual styles change the look and feel of the chat UI (e.g., Vanilla, Green Screen, iMessage).

**How it works:**
- Each style is a CSS file in the `styles/` directory.
- Styles are listed in `config/styles.properties` and in the style selector in `index.html`.

**How to add a new style:**
1. **Create a CSS file:**
   - Place it in `styles/` (e.g., `styles/my_theme.css`).
2. **Register in config:**
   - Add to `config/styles.properties`:
     ```
     My Theme=styles/my_theme.css
     ```
3. **Add to selector:**
   - Update the `<select id="style-selector">` in `index.html`:
     ```html
     <option value="my-theme">My Theme</option>
     ```
4. **Test:**
   - Switch to your new style in the app.

**Best practices:**
- Use unique class names or CSS variables to avoid conflicts.
- Test with all message types and UI panels.

---

## 3. Guardrails (Filters)

### A. Blocklist Filters

**What are they?**
- Blocklist filters block messages containing certain terms (e.g., sex, violence).

**How it works:**
- Each blocklist is a text file in `filters/` (e.g., `sex_blocklist.txt`).
- The `BlocklistFilter` class loads and applies these lists.
- Filters are registered in `scripts/filters/blocklist.js` and appear in the Guardrails panel.

**How to add a new blocklist filter:**
1. **Create a blocklist file:**
   - Place in `filters/` (e.g., `filters/hate_blocklist.txt`).
   - One term per line. Lines starting with `#` are comments.
2. **Register in code:**
   - Edit `scripts/filters/blocklist.js`:
     - Add your filter to the `blocklists` object and `initialize()` method.
3. **Test:**
   - Enable your filter in the Guardrails panel and try sending a blocked term.

### B. API-Based Filters (e.g., OpenAI Moderation)

**What are they?**
- Filters that use an external API to check for inappropriate content (e.g., OpenAI Moderation API).

**How it works:**
- API filters extend the `APIFilter` class (`scripts/filters/api_filter.js`).
- Example: `OpenAIModerationFilter` in `scripts/filters/openai_moderation.js`.
- Registered in the Guardrails panel as input/output filters.

**How to add a new API-based filter:**
1. **Create a new class:**
   - Extend `APIFilter` in a new JS file in `scripts/filters/`.
   - Implement the `check()` method to call your API and return a result.
2. **Register in Guardrails panel:**
   - Add your filter to the input/output filter lists in the Guardrails panel UI.
3. **Test:**
   - Enable your filter and verify it blocks/flags as expected.

**Best practices:**
- Handle API errors gracefully.
- Make sure your filter is fast and doesn't block the UI.

### C. Heuristic/Regex-Based Filters (e.g., Prompt Injection, Code)

**What are they?**
- Filters that use rule-based heuristics (regexes + weights) to detect patterns (e.g., prompt injection attempts, code output).

**How it works:**
- Implemented as standalone JS classes (see `scripts/filters/prompt_injection_filter.js`, `scripts/filters/code_output_filter.js`).
- Each filter defines a set of regex rules and a scoring/threshold system.
- Filters are registered in the Guardrails panel as input/output filters.

**How to add a new heuristic filter:**
1. **Create a new class:**
   - Copy and adapt `prompt_injection_filter.js` or `code_output_filter.js` in `scripts/filters/`.
   - Define your rules, threshold, and scoring logic.
2. **Register in Guardrails panel:**
   - Add your filter to the input/output filter lists in the Guardrails panel UI (`index.html`).
   - Use a unique value and display name.
3. **Wire up in main.js:**
   - Initialize your filter and add its check to the appropriate input/output filtering logic.
4. **Test:**
   - Enable your filter and verify it blocks/flags as expected.

**Best practices:**
- Provide clear descriptions for each rule (for user-facing explanations).
- Tune weights and thresholds to balance sensitivity and false positives.

---

## 4. API Key Management

The playground uses a flexible, extensible API key management system that supports multiple providers and storage strategies. This system is designed to be secure, user-friendly, and easy to extend.

### Key Concepts
- **APIKeyManager:** Singleton that manages all API keys, provides registration, retrieval, and event hooks
- **APIKey:** Represents a single key, tied to a provider and storage strategy
- **StorageStrategy:** Abstracts how/where a key is stored (e.g., localStorage, in-memory)

### Using the Key Manager
1. **Register a key:**
   ```js
   window.apiKeyManager.register({
       id: 'myprovider.key',
       provider: 'myprovider',
       label: 'My Provider Key'
   });
   ```

2. **Retrieve a key:**
   ```js
   const keyObj = await window.apiKeyManager.require('myprovider.key');
   const apiKey = keyObj.get();
   ```

3. **Listen for key events:**
   ```js
   window.apiKeyManager.on('keyChanged', (keyId) => {
       // Handle key change
   });
   ```

### Adding a New Provider
1. Register your provider's key with a unique ID
2. Use the manager to retrieve the key where needed
3. Handle key validation and error cases appropriately

For more details, see [API Key Management](api_key_management.md).

---

## 5. Advanced: Adding New Models

- To add a new model, create a new JS file in `scripts/models/` and implement the required interface:
  ```js
  class MyModel {
    async initialize(resourcePath) { ... }
    async generateResponse(userMessage, context) { ... }
    cancel() { ... }
  }
  ```
- Register your model in `config/models.properties`.
- Reference it in a personality in `config/personalities.properties`.

- For details on available models and how to configure them, see [models documentation](models.md).

---

## Questions?
Contact Steve Wilson on [LinkedIn](https://www.linkedin.com/in/wilsonsd/). 

Bots now introduce themselves using the first greeting from their script (SimpleBot) or a prompt-based introduction (GPT personalities).
SimpleBot script loading uses cache-busting for reliable updates. 