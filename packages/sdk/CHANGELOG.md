# Changelog

All notable changes to the VocalRoute SDK will be documented in this file.

## [0.2.10] - 2026-02-08

### Added
- **Custom AI Models**: Support for `intentModel` and `transcriptModel` in `aiConfig`.
- **Custom Base URL**: Added `baseURL` support to `aiConfig` for using OpenAI-compatible providers (Groq, Local LLMs, etc.).
- **Strict Mode**: New `strictMode` flag in `aiConfig` to disable internal fallbacks.
- **Improved Error Handling**: Technical AI errors are now captured and displayed in the Voice Overlay for easier debugging.
- **Feedback Loop**: Added community contact links to the README.

### Changed
- **Type Flexibility**: Refactored `RouteEntry` to support flexible path parameters and custom properties like `hash`.
- **Registry Integration**: Updated `VocalRouteProvider` to better handle generated registries.

## [0.2.8] - 2026-02-08

### Fixed
- Fixed type mismatch in `RouteRegistry` between generated output and SDK expectations.
- Improved `VocalRouteProvider` props to better align with `vocalroute scan` output.
