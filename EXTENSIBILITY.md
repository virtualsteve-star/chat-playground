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
     ```
3. **Test:**
   - Refresh the app. Your new personality should appear in the dropdown.

**Best practices:**
- Use clear, concise prompts for GPT personalities.
- For SimpleBot, follow the pattern/response format in existing scripts.

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

---

## 4. OpenAI API Key Management

- The OpenAI API key is required for GPT personalities and OpenAI-powered guardrails.
- The key is stored only in browser localStorage (never sent to any server except OpenAI).
- Users can add or clear their key in the Preferences panel.

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

---

## Questions?
Contact Steve Wilson on [LinkedIn](https://www.linkedin.com/in/wilsonsd/). 