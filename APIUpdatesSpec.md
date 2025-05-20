# Client‑Side API‑Key Infrastructure Specification

*for **Steve’s Chat Playground** (vNext)*

> **Revision 2025‑05‑18**   — clarified explicit support for **multiple keys per provider** (e.g. separate OpenAI keys for main chat vs. test harness) and labelled related API semantics.

---

## 1  Goals

|  #                                        |  Goal                                                                     |  Why                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
|  1                                        |  Hide storage details behind a clean interface                            | Keeps the rest of the codebase independent of where/how secrets persist.                |
|  2                                        |  Offer **session‑only** *or* **persistent** storage **per key**           | Lets privacy‑focused users avoid writing to disk while offering convenience for others. |
|  3                                        |  Support **many keys** across **many providers** ( *N‑key × M‑provider* ) | ‑ Parallel **OpenAI** keys (e.g. `openai.chat`, `openai.tests`)                         |
| ‑ Future support for Gemini, Claude, etc. |                                                                           |                                                                                         |
|  4                                        |  Provide a single **APIKeyManager** façade                                | Call‑sites ask the manager; they never touch storage or UI directly.                    |
|  5                                        |  Remain 100 % client‑side (static hosting, no backend)                    | Fulfills the playground’s hard requirement.                                             |

---

## 2  Key Concepts

| Term                 | Definition                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **APIKey**           | Represents **one** secret value, identified by a globally unique `id` and tied to a `provider`.  Exposes:<br>`get`, `set`, `clear`, `isSet`, `getProvider`, `getId`. |
| **StorageStrategy**  | Pluggable object that actually stores/loads the secret:<br>`InMemory`, `LocalStorage`, later `EncryptedLocal`…                                                       |
| **APIKeyManager**    | Singleton that keeps a **registry `Map<id,APIKey>`** and raises events (`keyChanged`, …). Supports **unlimited keys per provider**.                                  |
| **APIKeyDescriptor** | Plain JS object declared at startup:<br>`{ id, provider, label, defaultStrategy }`.  Each `id` must be unique (e.g. `"openai.chat"`, `"openai.tests"`).              |

---

## 3  User‑Facing UX Changes

### 3.1  Key‑Entry Dialog  (automatically shown by `APIKeyManager.require()`)

* **Prompt**: *“Please enter your <span id="providerLabel"></span> API key:”*
* **Password field** (`<input type="password">`).
* **Checkbox**: **“Store key between sessions”**

  * *Unchecked* ⇒ `InMemoryStrategy` (tab‑lifetime only).
  * *Checked*   ⇒ `LocalStorageStrategy` (persists on the device).
* **Tooltip** on the checkbox:
  “If checked, the key is saved in your browser’s local storage so you won’t have to re‑enter it next time on this device.”

### 3.2  Preferences → API Keys Panel *(one card per registered key)*

| UI Element                  | Behaviour                                                                         |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Label**                   | e.g. “OpenAI (Chat)” or “OpenAI (Tests)”.                                         |
| **Status chip**             | “**Set**” / “**Not Set**”.                                                        |
| **Storage mode**            | “Session‑only” or “Persistent” (auto‑updates).  Tooltip explains what each means. |
| **Change Storage** dropdown | Lets user switch strategy at runtime (`InMemory`, `LocalStorage`).                |
| **Clear Key** button        | Calls `apiKeyManager.clear(id)` and resets status.                                |

*Note:* UI is deliberately generic; more advanced multi‑key UX (e.g. grouping by provider) can be layered later without core changes.

---

## 4  High‑Level Component Diagram (text)

```
User Input → [Input Filters] → Model (SimpleBot│OpenAI) → [Output Filters] → Chat Window
                               ↑
                               │ fetch (needs auth header)
                               │
                +─────────────────────────────────────────────────+
                │           APIKeyManager (singleton)            │
                │  registry: Map<id, APIKey>                     │
                +───┬─────────────────────────────────────────────+
                    │ delegates            ▲ prompts
                    │                      │
               +────┴────+            +────┴────────+
               │ APIKey  │            │ Preferences │
               +──┬──────+            +────┬────────+
                  │ uses                   │ subscribes
+─────────────────┼────────────────────────┼─────────────────────────+
│         StorageStrategy impls (InMemory / LocalStorage / …)       │
+────────────────────────────────────────────────────────────────────+
```

This diagram illustrates multiple keys: each `APIKey` instance sits in the registry under its unique `id`; models or other code ask for the key they need (e.g. `openai.tests`) and receive the appropriate secret.

---

## 5  Public Interfaces (TypeScript‑centric)

```ts
/* StorageStrategy.ts */
export interface StorageStrategy {
  readonly name: string;              // "memory", "localStorage", …
  load(id: string): string | null;    // returns secret or null
  save(id: string, value: string): void;
  clear(id: string): void;
}

export const InMemoryStrategy:    StorageStrategy;  // non‑persistent
export const LocalStorageStrategy: StorageStrategy; // key = `apiKey:${id}`

/* APIKey.ts */
export class APIKey {
  constructor(descriptor: APIKeyDescriptor, strategy: StorageStrategy);
  getId(): string;                 // e.g. "openai.chat"
  getProvider(): string;           // e.g. "openai"
  isSet(): boolean;
  get(): string | null;
  set(value: string): void;
  clear(): void;
  switchStrategy(strategy: StorageStrategy): void; // runtime change
}

/* APIKeyManager.ts  — singleton */
export interface APIKeyDescriptor {
  id: string;        // unique key id
  provider: string;  // logical provider ("openai", "anthropic", …)
  label: string;     // human‑friendly
  defaultStrategy: StorageStrategy;
}

export class APIKeyManager {
  register(desc: APIKeyDescriptor[]): void;          // call once at boot
  get(id: string): APIKey;                           // throws if unknown id
  /** If key unset, prompts user; resolves once key is available. */
  require(id: string): Promise<APIKey>;
  clear(id: string): void;                           // removes secret
  on(event: "keyChanged"|"strategyChanged"|"keyCleared", handler: (id:string)=>void): void;
}
export const apiKeyManager = new APIKeyManager();
```

---

## 6  Initialization Example

```js
import { apiKeyManager } from './core/APIKeyManager.js';
import { InMemoryStrategy, LocalStorageStrategy } from './core/strategies.js';

apiKeyManager.register([
  // main chat window — convenience key persists by default
  { id: 'openai.chat',  provider: 'openai', label: 'OpenAI (Chat)',  defaultStrategy: LocalStorageStrategy },
  // test harness — privacy‑sensitive, prefer session‑only by default
  { id: 'openai.tests', provider: 'openai', label: 'OpenAI (Tests)', defaultStrategy: InMemoryStrategy }
]);
```

Any model/component now calls:

```js
const key = await apiKeyManager.require('openai.tests');
fetch('https://api.openai.com/v1/chat/completions', {
  headers: { Authorization: `Bearer ${key.get()}` },
  body: JSON.stringify(payload)
});
```

---

## 7  Refactor Checklist

1. **Core layer** — create `core/` with Strategy, APIKey, Manager.
2. **Replace direct localStorage calls** (search for `'openai_api_key'`).
3. **Dialog** — add checkbox & tooltip; honour choice when saving.
4. **Preferences panel** — iterate over `apiKeyManager.registry` to render each key.
5. **Unit tests** — cover multi‑key flows (two OpenAI keys) & strategy switching.
6. **Docs** — update README; add animated GIF of new dialog.

---

## 8  Security Notes

| Concern                     | Mitigation                                                        |
| --------------------------- | ----------------------------------------------------------------- |
| Shoulder‑surfing            | Input field type = `password`.                                    |
| LocalStorage attack surface | Namespace `apiKey:`; instruct users how to clear.                 |
| Session secrets             | `InMemoryStrategy` holds secret only in closure; GC on tab close. |
| Mixed‑provider leakage      | Keys never leave browser except to their intended API endpoint.   |

---

## 9  Future Extensions

* **EncryptedLocalStrategy** — AES‑GCM via WebCrypto; optional passphrase.
* **Provider groups** — UI grouping of cards by provider symbol/color.
* **Key import/export** — allow JSON backup of all keys (encrypted).
* **Policy hooks** — e.g. per‑key rate‑limit or expiry metadata.

---

**End of spec.**
