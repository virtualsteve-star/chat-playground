# Steve's Chat Playground

A companion project to [The Developer's Playbook for Large Language Model Security](https://www.amazon.com/Developers-Playbook-Large-Language-Security/dp/109816220X) and the [OWASP Top 10 for LLM Applications](https://genai.owasp.org), this open-source HTML/JavaScript application provides a hands-on environment for experimenting with various chat models, personalities, guardrails and user interfaces locally, quickly and with zero connectivity or cost.

**▶️ [Watch the Demo Video](https://youtu.be/ZRcW4mnuoTM)**

With the rapid evolution of LLM and Generative AI technology (new models, techniques, agents, etc.), it's become increasingly challenging for developers to find a practical starting point for hands-on experimentation. This playground addresses that need by offering:

- **Multiple Models:** From simple local pattern-matching to OpenAI's powerful models.  Some models have vulnerabilities and back doors for testing and experimentation ([see models](documentation/models.md))
- **Different Views:** Various UI styles to understand how different interfaces affect user experience
- **Guardrails:** Both simple local filters and advanced AI-powered content moderation ([see guardrails](documentation/guardrails.md), [see extensibility](documentation/extensibility.md))
- **Zero Dependencies:** Everything runs in the browser, making it easy to get started

Features a zero-dependency SimpleBot model and simple keyword-based guardrails for rapid prototyping and testing of chat experiences without external API costs, perfect for understanding the fundamental security properties of LLM interactions. ([see personalities](documentation/personalities.md))

## Try It Out!

The chat playground is live at: [https://virtualsteve-star.github.io/chat-playground/](https://virtualsteve-star.github.io/chat-playground/)

Try different personalities, guardrails and visual styles directly in your browser - no installation required! The playground offers two tiers of functionality:

### Local Experience (No API Key Required):
- SimpleBot personalities (some with built-in vulnerabilities)
- Basic rule-based guardrails
- All visual styles and UI features
- Perfect for understanding fundamental concepts

### Full Experience (API Key Required):
- API-powered bot personalities using real OpenAI models
- Advanced AI-powered content moderation and guardrails
- All local features plus smarter responses
- Great for exploring more sophisticated interactions

For the full experience including OpenAI-powered personalities and advanced guardrails, you'll need to enter your API key. The playground uses a flexible, secure API key management system that:
- Stores keys only in your browser (never sent to any server except the intended API)
- Supports both persistent and session-only storage
- Provides a clean interface for managing keys in the Preferences panel
- Automatically handles key validation and error cases

For more details on the API key management system, see [API Key Management](documentation/api_key_management.md).

## Features
- Clean, intuitive chat interface
- Support for streaming token responses
- Multiple visual styles (Vanilla, iMessage, iMessage Dark, Green Screen)
- Local testing with SimpleBot (based on ELIZA-style pattern matching)
  - Zero external dependencies
  - Instant response times
  - Easily create new personalities with simple text files
  - Perfect for UI/UX testing and prototyping
- Remote model support (using OpenAI ChatGPT 4o-mini)
- Thumbs up/down feedback for responses
- **Guardrails (Input & Output Filters):**
  - Local blocklist filters (e.g., Sex, Violence)
  - Heuristic/regex-based filters (e.g., Prompt Injection, Code)
  - Input Length filter (local, blocks messages over 256 characters)
  - Rate Limit filter (local, max 10 prompts per minute)
  - AI-powered filters (OpenAI Moderation, OpenAI Nano Prompt Injection)
  - All filters are selectable in the Guardrails panel
  - Custom filters can be added (see EXTENSIBILITY.md)
- Multiple personalities [Full list and details](documentation/personalities.md)
- Complete automated [test suite](documentation/tests.md)

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenAI API key (for advanced features)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/virtualsteve-star/chat-playground.git
   cd chat-playground
   ```
2. Open `index.html` in your web browser. Serve it using a simple HTTP server:
   ```
   python3 -m http.server
   ```
   Then visit http://localhost:8000 in your browser.
3. For API-powered, advanced features, you'll be prompted to enter your API key when you first select a feature that uses the the OpenAI API set.

## Usage
1. Select a personality from the dropdown menu.
2. Type your message in the input field and press Enter or click Send.
3. Use the style selector to switch between different visual themes.
4. Provide feedback on responses using the thumbs up/down buttons.

## Project Structure

```
steves-chat-playground/
├── README.md             # Main project readme
├── VERSION_HISTORY.md    # Release notes
├── LICENSE               # License
├── favicon.ico           # Site icon
├── index.html            # Main app page
├── assets/               # Images and graphics
├── config/               # Config files for models, personalities, styles
├── documentation/        # All documentation (extensibility, models, etc.)
├── historical/           # Legacy/archived files (API specs, etc.)
├── personalities/        # Bot scripts/prompts
├── scripts/              # JavaScript source code
├── styles/               # CSS stylesheets
└── tests/                # Test suites and data
```

## Data Flow: How Guardrails and Personalities Work Together

<img src="documentation/DataFlow.svg" alt="Data Flow Diagram" style="max-width: 100%; height: auto; margin: 16px 0;">

When a user submits a message, it first passes through a series of configurable **Input Filters** (guardrails) that can block or modify risky content. The filtered prompt is then passed to a selected **Personality**, which determines how the chatbot behaves (e.g., therapist, banker, jailbroken model). A Personality is defined as **Model + Instructions**. After generating a response, the output is then screened by **Output Filters** (guardrails) to catch policy violations before being displayed in the chat window.

This layered design makes it easy to test how different filters and bot configurations affect system behavior—all without modifying backend code. Input and output filters are both types of guardrails, designed to help ensure the personality stays in alignment with your safety and policy requirements.

## Test Suite for Guardrails

There is an included [automated test suite](documentation/tests.md) for guardrails and filters. This suite enables automated, bulk testing of all input and output filters (guardrails) in the playground. It includes hundreds of sample prompts and responses—100 RISKY and 100 BENIGN examples per category—generated by OpenAI's o3 model. The test suite covers:

- Prompt Injection
- Sexual Content
- Violence Content
- Code Generation (output)

You can run these tests directly in your browser to evaluate the effectiveness of each filter, compare results, and iterate on your own custom guardrails. This makes it easy to benchmark, debug, and improve LLM security features at scale.

## Want to Extend It?
- See [documentation/extensibility.md](documentation/extensibility.md) for how to add new personalities, styles, or guardrails.
- See [documentation/models.md](documentation/models.md) for details on model types and configuration.
- See [documentation/personalities.md](documentation/personalities.md) for details on personalities and their configuration.
- See [documentation/guardrails.md](documentation/guardrails.md) for a full list and explanation of input/output filters.

## Version History
- See [VERSION_HISTORY.md](VERSION_HISTORY.md) for release notes and features.

---

Created by Steve Wilson. [LinkedIn](https://www.linkedin.com/in/wilsonsd/)
MIT License. 