# Version History

## 0.5.1 (May 6, 2023)
- Tweaks for improved extensibility:
  - Modularized guardrails and moderation filters
  - Added clear documentation for extending personalities, styles, and guardrails
  - Improved code structure for easier extension and maintenance
- Major cleanup and modularization of Green Screen (terminal) code

## 0.5 (May 5, 2023) — First Release

- Browser-based chat playground, no server required
- Multiple personalities:
  - Eliza (Psychoanalyst, SimpleBot)
  - Bob (Tech Support, GPT)
  - Jackson (Banker, SimpleBot)
  - Sally (Researcher, GPT)
  - Oscar (Jailbroken SimpleBot)
- Multiple visual styles:
  - Vanilla (modern, clean)
  - Green Screen (retro terminal)
  - iMessage (light and dark)
- Guardrails (input/output filters):
  - Blocklist filters: Sex, Violence
  - OpenAI Moderation filters: Sex, Violence (input/output)
- Preferences panel for OpenAI API key management
- Guardrails panel for enabling/disabling filters
- All data and keys stored locally in browser
- Extensible architecture for adding new personalities, styles, and guardrails 