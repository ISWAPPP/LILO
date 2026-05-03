# Changelog — LILO Tools

## [0.9.1] — 2026-05-03

### Added
- **Zen Browser UI Replication**: Completely redesigned the theme selection interface to match the Zen Browser "Edit Theme" palette.
- **Enhanced Palette Picker**: Introduced a horizontal scrolling color swatch gallery with dedicated mode toggles (System, Light, Dark).
- **Expanded Theme Library**: Added 11 unique color palettes including Matcha, Peach, Lavender, and Nord.

### Fixed
- **UI Layout**: Increased padding in the theme palette to prevent clipping of selected swatches.
- **Content Security Policy (CSP)**: Resolved a critical error in Chrome where inline scripts were blocked. Moved theme detection logic to a separate file (`core/theme-init.js`).

## [0.8] — 2026-05-03

### Added
- **Window Height Setting**: Added a slider in the settings tab to control the maximum height of the extension window.

### Fixed
- **Theme Override Bug**: Fixed an issue where the dark theme CSS variables would unintentionally override custom themes (like Forest, Paper, Sea) when the system preferred dark mode.
- **Notes UI**: Notes now visually truncate to display only the first two lines to keep the list compact.

## [0.7] — 2026-05-01

### Added
- **Premium UI Enhancements**: Integrated a custom "Glow" spinner and smooth fade-in-up animations for results.
- **Enhanced I18n**: Added comprehensive localization for error states and network messages in DNS module.

### Fixed
- **Startup Performance**: Eliminated the "flash of white" during startup by implementing synchronous theme detection using a `localStorage` cache.
- **Theme Refinement**: Optimized color palettes for success (copy) and error states across all themes (Dark, Forest, Paper, Sea).
- **Code Quality**: Refactored the DNS module to separate rendering from logic and moved inline styles to CSS classes.

## [0.6] — 2026-05-01

### Added
- **IP Geolocation**: Integrated `ip-api.com` to provide location data for domains and IP addresses.
- **Enhanced DNS Results**: A-records now display country and city information.
- **MX Target Resolution**: MX records now show the resolved IP addresses of their mail servers.
- **Smart Copying**: Geolocation data and auxiliary MX IPs are now excluded when copying results to the clipboard for cleaner data handling.

## [0.5] — 2026-05-01

### Added
- **Secure Password Generator**: Switched to a cryptographically strong algorithm that eliminates modulo bias.
- **Upload Validation**: Added a 10MB file size limit for the PICS feature to prevent browser/server overload.

### Fixed
- **Stability**: Migrated notes identification to `crypto.randomUUID()` to prevent ID collisions.
- **Robust API**: Improved handling of non-JSON error responses from image hosting services.

### Removed
- **Dead Code**: Cleaned up the codebase by removing the unused `httpPing` function.

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
