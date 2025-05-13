# Version History

## 0.6 beta (June 2024)
- Major guardrails/filters upgrade:
  - Added local heuristic/regex-based filters: Prompt Injection, Code generation (output)
  - Added AI-based prompt injection detector based on OpenAI Nano 
  - Improved blocklist and moderation filter UI (clearer names, tooltips, grouping)
  - Output filters now block code and prompt injection attempts with user-facing explanations and certainty scores
  - Disabled token streaming when output filters are active.  Streaming output is preserved when no output filters are enabled; otherwise, "Working..." and "Filtering..." bubbles provide feedback
- Extensibility improvements:
  - Easy to add new custom filters (see EXTENSIBILITY.md)
  - Documentation updated for new filter types and best practices
- New personality: Hopper (Backdoored, SimpleBot) — a doctor bot that includes  backdoor activation phrases for security testing
- Bot introduction logic improved: bots now introduce themselves using their script (SimpleBot) or prompt (GPT)
- SimpleBot logic cleanups and improved script parsing
- Cache-busting for personality scripts/prompts ensures updates are always loaded
- Numerous bugfixes and UX polish 
- CSS cleanups: Vanilla is now a true base style, and all theme-specific layout and color is isolated for easier extensibility.

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
  - Oscar (Jailbroken, SimpleBot)
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