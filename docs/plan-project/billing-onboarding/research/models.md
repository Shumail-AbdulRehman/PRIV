# Model IDs and requested execution profile — 2026-11-06

The user explicitly requested implementation by Sol at medium effort. Set every implementing Codex session to `gpt-6.1-sol`, reasoning effort `medium`; do not silently switch models for Heavy specs. Heavy/Standard/Light in headers describe risk and sizing, not a mandate to override the user's model. Specs are intentionally small, with explicit fixtures and assertions to make medium-effort execution practical.

Official sources searched and opened:

- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol): exact ID `gpt-6.1-sol`; medium effort supported. This ID is also exposed in the current session's model catalog.
- [Claude overview](https://platform.claude.com/docs/en/models/overview): API IDs `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`.
- [Gemini 3.1 Pro](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview?authuser=7&hl=en): exact model code `gemini-3.1-pro-preview`. The web parser failed for the direct page; a read-only HTTPS fetch followed the official redirect to aistudio.google.com/docs/models/gemini-3.1-pro-preview, returned HTTP200, and confirmed the exact model ID in its content. No API call or credential was used.

Headers retain the three-provider schema required by the local validator. Only Sol medium is the requested execution profile; alternate Claude/Gemini IDs are portability metadata and are not a proposal to run those providers. Gemini 3.1 Pro is deliberately used across tiers rather than inventing unverified Flash IDs. The extra Reasoning header is explanatory: verify the actual runner's setting; no claim is made that arbitrary runner versions parse it.

- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference), opened through the official developers.openai.com/codex/config-reference redirect: confirms model_reasoning_effort as the supported configuration key. Local codex --help confirms -m and -c. The README launch command sets the explicit requested profile; no agent was launched.
