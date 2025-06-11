# Version History

## 0.9.5 (Unreleased)
- Major CSS architecture refactor:
  - Consolidated 4 CSS files into single variable-driven system
  - Eliminated all `!important` declarations for cleaner, more maintainable CSS
  - Added CSS Architecture Test Suite for ongoing validation
  - Improved theme extensibility: New themes now require only 3-5 lines vs 200+ previously

---

## 0.9 (2025-06-09)
- Added copy button to chat bubbles for easy response copying (PR #46 by @megahelio)
- Updated toolbar styling for a more compact, space-efficient look:
  - Toolbar buttons (Guardrails, Preferences, About) are now square, emoji-based, and visually uniform.
  - Tighter spacing between controls and buttons for a true toolbar feel.
  - Improved CSS for consistent sizing and alignment across all themes.

## 0.8.5 (2025-05-26)
- Added smoke tests for quick validation
- Improved test cleanup and error handling
- Clean up old API handling code and update usage
- Improved HTML escaping for test results - Snyk suggestion

## 0.8.2 (2025-05-23)
- Major test suite refactor:
  - All test pages now use shared CSS (`test_styles.css`) and shared JS setup (`shared_test_setup.js`).
  - Per-test configuration is parameterized via `window.TEST_CONFIG` for maintainability and extensibility.
  - Old, duplicated test pages removed; new refactored versions now standard.

## 0.8.1 (2025-05-20)
- Fixed path bug causing Blocklists to fail in deployment on GitHub pages.
- Added social preview for Twitter/X

## 0.8.1 (2025-05-20)

### API Key Management Overhaul
- New extensible API key manager for all OpenAI access (future multi-provider support).
- All key handling now routed through the manager; legacy methods removed.
- Simple, always-modal browser prompt for key entry.
- Preferences and test suites reflect key status and allow key entry/clearing.
- AI-powered tests are skipped (with clear UI/summary) if the API key is not set; local-only tests always run.
- Docs and test suite UI clarify API key requirements and skipping behavior.
- Added key storage options:
  - Single session (in-memory) storage for enhanced privacy
  - Persistent (localStorage) storage option for convenience
  - Clear UI controls for managing storage preference

---

## 0.8 (2025-05-17)
- Major guardrails/filters upgrade:
  - Added local heuristic/regex-based filters: Prompt Injection, Code generation (output)
  - Added Input Length filter (local, blocks messages over 256 characters)
  - Added Rate Limit filter (local, max 10 prompts per minute)
  - Added AI-based prompt injection detector based on OpenAI Nano 
  - Improved blocklist and moderation filter UI (clearer names, tooltips, grouping)
  - Guardrails panel UI improved for long lists (tighter spacing)
  - Output filters now block code and prompt injection attempts with user-facing explanations and certainty scores
  - Disabled token streaming when output filters are active.  Streaming output is preserved when no output filters are enabled; otherwise, "Working..." and "Filtering..." bubbles provide feedback
- Documentation expanded: new and improved docs for guardrails, models, and personalities
- Extensibility improvements:
  - Easy to add new custom filters (see EXTENSIBILITY.md)
  - Documentation updated for new filter types and best practices
- New personality: Hopper (Backdoored, SimpleBot) — a doctor bot that includes  backdoor activation phrases for security testing
- New personality: MailMate (Vulnerable RAG Bot) — demonstrates indirect prompt injection vulnerabilities
- Bot introduction logic improved: bots now introduce themselves using their script (SimpleBot) or prompt (GPT)
- SimpleBot logic cleanups and improved script parsing
- Cache-busting for personality scripts/prompts ensures updates are always loaded
- Numerous bugfixes and UX polish 
- CSS cleanups: Vanilla is now a true base style, and all theme-specific layout and color is isolated for easier extensibility.
- Creation of the test suite for prompt injection, sexual content, violence content, and code generation filters. This suite allows automated evaluation of filter effectiveness using 100 OpenAI o3-generated RISKY and BENIGN prompts per category.

## 0.5.1 (2025-05-06)
- Tweaks for improved extensibility:
  - Modularized guardrails and moderation filters
  - Added clear documentation for extending personalities, styles, and guardrails
  - Improved code structure for easier extension and maintenance
- Major cleanup and modularization of Green Screen (terminal) code

## 0.5 (2025-05-05) — First Release

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
