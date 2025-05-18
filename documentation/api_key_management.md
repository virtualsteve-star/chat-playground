# API Key Management

Steve's Chat Playground uses a flexible, extensible API key management system to support secure, user-friendly handling of secrets for OpenAI and future providers. This page explains how it works and how to extend or integrate with it.

---

## Overview

- **Centralized management:** All API key access is routed through a single `APIKeyManager` instance.
- **Multiple providers:** The system is designed to support multiple providers (e.g., OpenAI, Anthropic, Gemini) and multiple keys per provider.
- **Pluggable storage:** Supports both persistent (localStorage) and session-only (in-memory) storage strategies (future extensibility).
- **No backend:** All key management is 100% client-side; keys never leave the browser except to their intended API endpoints.

---

## Key Concepts

- **APIKeyManager:** Singleton that manages all API keys, provides registration, retrieval, and event hooks.
- **APIKey:** Represents a single key, tied to a provider and storage strategy.
- **StorageStrategy:** Abstracts how/where a key is stored (e.g., localStorage, in-memory, future encrypted storage).
- **Key Descriptor:** Declares a key's id, provider, label, and default storage strategy.

---

## How It Works

1. **Registration:**
   - At startup, the app registers all required keys with the manager:
     ```js
     window.apiKeyManager.register({
         id: 'openai.chat',
         provider: 'openai',
         label: 'OpenAI (Chat)'
     });
     ```
2. **Key Entry:**
   - When a key is required and not set, the manager prompts the user (using a simple browser prompt for now).
   - The key is validated (for OpenAI, a test API call is made).
   - The key is stored using the configured strategy (default: localStorage).
3. **Key Retrieval:**
   - All code that needs a key calls:
     ```js
     const keyObj = await window.apiKeyManager.require('openai.chat');
     const apiKey = keyObj.get();
     ```
   - This ensures the key is always available and up-to-date.
4. **Preferences Panel:**
   - Users can view, add, or clear keys in the Preferences panel.
   - The UI reflects key status and storage mode.
5. **Test Suite Integration:**
   - The test runner and all test pages use the manager for key access.
   - AI-powered tests are skipped if the key is not set, with clear UI feedback.

---

## Extending the System

- **Add a new provider:**
  1. Register a new key with a unique id and provider name.
  2. Use the manager to retrieve the key where needed.
- **Add a new storage strategy:**
  1. Implement the `StorageStrategy` interface.
  2. Register keys with the new strategy as needed.
- **Listen for key events:**
  - Subscribe to `keyChanged`, `keyCleared`, or `strategyChanged` events for custom UI or logic.

---

## Security Notes

- **No backend:** All key management is client-side; keys are never sent to any server except the intended API.
- **LocalStorage:** Persistent keys are stored in localStorage (base64-encoded, not encrypted).
- **Session-only:** (Planned) In-memory strategy will keep keys only for the browser session.
- **User control:** Users can clear keys at any time from Preferences.

---

## Future Directions

- **Session-only and encrypted storage options.**
- **Support for multiple keys per provider and advanced UI grouping.**
- **Import/export and backup of keys.**
- **Policy hooks (e.g., per-key rate limits, expiry).**

---

For more details, see the implementation in `/scripts/core/` 