# Changelog — LILO Tools

## [0.4] — 2026-05-01

### Added
- **Multi-Theme Support**: Introduced 5 custom UI themes (Light, Dark, Forest, Paper, Sea) and an "Auto" mode that follows system preferences.
- **Settings Footer**: Added direct links to the feedback page and changelog in the settings tab.
- **English Codebase**: Translated all internal code comments to English for better accessibility.

### Removed
- **Recurring Feedback Popup**: Removed the modal that appeared on first visit and every 8 hours.

## [0.3] — 2026-04-30

### Added
- **Settings Page**: Implemented a full user interface for extension management.
- **Localization**: Added support for English and Ukrainian (Auto-detect or manual selection).
- **Tab Memory**: Option to open the extension on the last used tab or select a specific startup tab.
- **DNS Selection**: Added the ability to choose the DNS provider (Google 8.8.8.8 or Cloudflare 1.1.1.1).
- **Secret PICS Mode**: The PICS tab is now hidden by default and activated via the `GETPICS` command in notes.

### Fixed
- **Cloudflare CORS**: Resolved DNS access issues by updating headers and `manifest.json` permissions.
- **Accessibility**: Associated `<label>` elements with input fields to resolve console errors and improve UX.
- **Stability**: Enhanced error handling for network requests.

### Removed
- **IPAPI.co**: Removed the geolocation module due to CORS issues and 403 Forbidden errors.

## [0.2] — 2026-04-21
- Initial modular architecture.
- Core DNS, PICS, and NOTES functionality.
- Basic UI with dark theme support.
