# Guardrails (Input & Output Filters)

Guardrails are filters that help protect chatbots from unsafe, inappropriate, or adversarial user input and output. They are a core security and safety feature in Steve's Chat Playground, allowing you to experiment with different types of content moderation and prompt defense strategies.

Guardrails can be:
- **Local:** Run entirely in the browser, with no external dependencies. These are fast, private, and cost-free, but may be less sophisticated.
- **API-based:** Use external services (like OpenAI Moderation) for smarter, context-aware filtering. These may be more accurate but require an internet connection and sometimes an API key.

Guardrails are divided into **Input Filters** (which check user messages before they reach the model) and **Output Filters** (which check the model's responses before they are shown to the user).

For details on how to add or extend guardrails, see the [extensibility guide](extensibility.md).

## Input Filters

Listed in the order they appear in the Guardrails panel:

### 1. Input Length (local)
- **Type:** Local
- **Description:** Blocks user messages longer than 256 characters. Useful for preventing prompt injection via long payloads, spam, or denial-of-service attempts.
- **Vulnerabilities addressed:** Prompt injection, resource exhaustion, spam.

### 2. Rate Limit (local)
- **Type:** Local
- **Description:** Limits the user to 10 prompts per minute. Prevents abuse, flooding, and brute-force attacks.
- **Vulnerabilities addressed:** Denial-of-service, brute-force, spam.

### 3. Sex (local)
- **Type:** Local
- **Description:** Blocks messages containing terms from a local sexual content blocklist. Helps keep conversations appropriate.
- **Vulnerabilities addressed:** Inappropriate content, policy violations.

### 4. Violence (local)
- **Type:** Local
- **Description:** Blocks messages containing terms from a local violence blocklist. Helps prevent violent or threatening content.
- **Vulnerabilities addressed:** Inappropriate content, policy violations.

### 5. Prompt Injection (local)
- **Type:** Local, heuristic/regex
- **Description:** Detects and blocks common prompt injection patterns using regex rules. Helps defend against attempts to subvert the chatbot's instructions.
- **Vulnerabilities addressed:** Prompt injection, jailbreaks, system prompt leaks.

### 6. Sex (AI)
- **Type:** API (OpenAI Moderation)
- **Description:** Uses OpenAI's Moderation API to detect sexual content. More context-aware than local blocklists.
- **Vulnerabilities addressed:** Inappropriate content, policy violations.

### 7. Violence (AI)
- **Type:** API (OpenAI Moderation)
- **Description:** Uses OpenAI's Moderation API to detect violent content. More context-aware than local blocklists.
- **Vulnerabilities addressed:** Inappropriate content, policy violations.

### 8. Prompt Injection (AI)
- **Type:** API (OpenAI LLM - 4.1-nano w/ Custom Prompt)
- **Description:** Uses a small OpenAI model to detect prompt injection attempts. Can catch more subtle or novel attacks than regex-based filters.
- **Vulnerabilities addressed:** Prompt injection, jailbreaks, system prompt leaks.

## Output Filters

Listed in the order they appear in the Guardrails panel:

### 1. Sex (local)
- **Type:** Local
- **Description:** Blocks model responses containing terms from a local sexual content blocklist.
- **Vulnerabilities addressed:** Inappropriate output, policy violations.

### 2. Violence (local)
- **Type:** Local
- **Description:** Blocks model responses containing terms from a local violence blocklist.
- **Vulnerabilities addressed:** Inappropriate output, policy violations.

### 3. Code (local)
- **Type:** Local, heuristic/regex
- **Description:** Blocks responses that appear to contain code (e.g., Python, SQL, C/C++). Useful for preventing code generation in restricted scenarios.
- **Vulnerabilities addressed:** Data leakage, code execution, policy violations.

### 4. Sex (AI)
- **Type:** API (OpenAI Moderation)
- **Description:** Uses OpenAI's Moderation API to detect sexual content in model output.
- **Vulnerabilities addressed:** Inappropriate output, policy violations.

### 5. Violence (AI)
- **Type:** API (OpenAI Moderation)
- **Description:** Uses OpenAI's Moderation API to detect violent content in model output.
- **Vulnerabilities addressed:** Inappropriate output, policy violations.

---

For technical details on how guardrails are implemented, see the [extensibility guide](extensibility.md). 