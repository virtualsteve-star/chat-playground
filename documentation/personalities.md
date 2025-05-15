# Personalities

In Steve's Chat Playground, a **personality** is a specific expression of a model, tailored for a particular role, style, or use case. Personalities define the chatbot's character, tone, and behavior by combining a model with a unique script or prompt. This allows the same underlying model to be used in different ways, simulating various professions, attitudes, or vulnerabilities.

Each personality is defined in `config/personalities.properties` and references a model and a resource file (script or prompt).

## Available Personalities

### Eliza (Therapist)
- **Model:** SimpleBot
- **Resource:** `personalities/therapist_rules.txt`
- **Description:**
  - Classic psychotherapist chatbot inspired by ELIZA.
  - Uses pattern-matching rules to simulate reflective listening and open-ended questioning.
  - Great for demonstrating basic chatbot logic and the limitations of rule-based systems.

### Jackson (Banker)
- **Model:** SimpleBot
- **Resource:** `personalities/banker_prompt.txt`
- **Description:**
  - Simulates a conservative, by-the-book banker.
  - Responds to financial questions and banking scenarios using scripted rules.
  - Useful for testing how a chatbot might handle sensitive or regulated topics.

### Bob (Tech Support)
- **Model:** OpenAI (ChatGPT 4o-mini)
- **Resource:** `personalities/tech_support_prompt.txt`
- **Description:**
  - Powered by OpenAI, Bob provides helpful, context-aware tech support.
  - Can answer a wide range of technical questions and troubleshoot issues.
  - Demonstrates the flexibility and depth of API-based models.

### Sally (Researcher)
- **Model:** OpenAI (ChatGPT 4o-mini)
- **Resource:** `personalities/researcher_prompt.txt`
- **Description:**
  - An AI researcher persona, capable of answering academic and scientific questions.
  - Uses OpenAI's model for more nuanced, detailed responses.
  - Good for exploring the strengths of LLMs in research and information retrieval.

### Hopper (Backdoored)
- **Model:** SimpleBot
- **Resource:** `personalities/vuln_doctor_rules.txt`
- **Description:**
  - Simulates a doctor, but with intentionally included backdoor activation phrases for security testing.
  - Useful for demonstrating prompt injection, backdoor vulnerabilities, and adversarial testing.
  - **Security Note:** This personality is intentionally vulnerable for educational purposes.

### Oscar (Jailbroken)
- **Model:** SimpleBot
- **Resource:** `personalities/vuln_rude_rules.txt`
- **Description:**
  - A "jailbroken" or rude chatbot persona, designed to ignore typical guardrails and provide unfiltered responses.
  - Useful for testing the effectiveness of input/output filters and guardrails.
  - **Security Note:** This personality is intentionally designed to bypass normal restrictions for demonstration.

## How Personalities Are Configured

Personalities are defined in `config/personalities.properties`:

```
Eliza (Therapist)=SimpleBot,personalities/therapist_rules.txt
Jackson (Banker)=SimpleBot,personalities/banker_prompt.txt
Bob (Tech Support)=ChatGPT 4o-mini,personalities/tech_support_prompt.txt
Sally (Researcher)=ChatGPT 4o-mini,personalities/researcher_prompt.txt
Hopper (Backdoored)=SimpleBot,personalities/vuln_doctor_rules.txt
Oscar (Jailbroken)=SimpleBot,personalities/vuln_rude_rules.txt
```

Each entry maps a personality name to a model and a resource file. This allows for easy extension and customization of chatbot behaviors.

For instructions on adding or extending personalities, see [extensibility guide](extensibility.md).
For details on model types, see [models documentation](models.md). 