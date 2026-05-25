# Changelog — LILO Tools

## [0.9.19] — 2026-05-26

### Improved
- **Sleek Thinner DNS Domain Input**: Reduced the thickness (height) of the DNS input field and the GO button from 48px to a highly-refined 38px, optimizing vertical space usage.
- **Restored Balanced Full-Width Layout**: Returned the input field and history chips container to their natural full-width sizing inside the extension window, maintaining a uniform and premium grid structure.

## [0.9.18] — 2026-05-26

### Added
- **Smart DNS History Filtering**: History is now saved only on plugin activation (automatic tab lookup) or manual search trigger (GO/Enter). Navigating via history tags performs queries without mutating or re-triggering history logs.

### Improved
- **Optimized Layout Width**: Narrowed the DNS input row and centered it for a highly-refined and balanced aesthetic.
- **Symmetric Spacing**: Optimized vertical spacing between the input bar, history clouds, and domain records to form a cleaner visual column.

## [0.9.17] — 2026-05-26

### Improved
- **Unified Domain Input Styling**: Redesigned the primary DNS input field to inherit the premium, monospace styling of the results domain header (taller 48px height, monospace font family, accent text color, and soft secondary background).
- **Eliminated Domain Duplication**: Removed the redundant results header from the query output container, keeping exactly one beautifully styled domain field visible at the top of the interface.

## [0.9.16] — 2026-05-26

### Removed
- **DNS Favorites Panel & Star Button**: Completely removed all traces of the domain pinning/favorites feature, the star icon (★) from search results, and related storage mechanisms, simplifying the DNS tab down to essential lookup history.

### Improved
- **Modern Textless History Icon**: Replaced the history emoji (🕒) with a custom vector SVG clock icon that fits perfectly with the modern design guidelines.

## [0.9.15] — 2026-05-26

### Added
- **Interactive DNS Pinboard (Favorites & History)**: Created a tag cloud quick-access row under the search input displaying favorited domains (starred with ★) and recently searched domains (🕒). Clicking any chip instantly triggers a DNS query; items can be easily removed.
- **Dynamic Note Markdown Rendering**: Notes now automatically render as rich text with styling for bold text (`**`), list items (`-`), inline code (`` ` ``), and syntax-styled multi-line code blocks (`` ``` ``), while maintaining simple raw textarea editing on click.
- **Zero-Friction Notes Clipboard Integration**: Maintained raw Markdown format for clipboard copy operations upon note selection, ensuring clean text-scraping for developers.

## [0.9.14] — 2026-05-26

### Added
- **Unified A/NS DNS Grouping**: Redesigned A and NS query results to merge multiple records logically under single consolidated cards instead of rendering distinct separate blocks.

### Improved
- **Micro-Spacing Optimization**: Comprehensively tightened CSS paddings, margins, and gaps across all DNS result cards, headers, and individual rows, establishing an extremely compact, professional layout.
- **Double Margin Bug Fix**: Resolved a layout bug causing double vertical spacing by eliminating bottom margins on `.dns-group-card` and relying solely on the container gap.
- **Pre-wrap Spacing & Alignment Fix**: Resolved a critical layout glitch where `white-space: pre-wrap` rendered unwanted newlines and indentation from JavaScript templates as massive vertical gaps and pushed IP addresses to the far right. Grouped record rows are now rendered on a single tight line.
- **Dual Copy Clipboard Delegation**: Upgraded copy delegation to selectively copy individual values when clicking specific IP/NS rows, and copy all addresses separated by a newline when clicking the card header or outer borders.
- **Modern Textless Copy Indicators**: Replaced raw copy-warning spans with elegant, textless inline double SVGs that smoothly transition from a copy icon to a green validation checkmark upon successful copying, completely eliminating false hover notifications.

## [0.9.13] — 2026-05-23

### Added
- **DNS Geolocation for All A Records**: Each IPv4 address now shows its own country and city when available.
- **PICS Upload Progress Bar**: Visual upload progress with percentage during image upload.
- **Password Generator — Exclude Similar Characters**: Optional checkbox to omit ambiguous characters (`0`, `O`, `1`, `l`, `I`, `|`).
- **Extension Icons**: Added toolbar and manifest icons.

### Improved
- **Settings Cache**: In-memory cache for `Settings.load()` avoids redundant `chrome.storage` reads during a popup session.
- **English as Primary Language**: Default UI language and HTML `lang` set to English.

### Removed
- **DNS History Placeholder**: Removed unused `#history-list` container from the DNS tab.
- **Encryption Claims**: Manifest description no longer mentions encrypted notes (notes are stored locally in plain text).

## [0.9.12] — 2026-05-15

### Fixed
- **DKIM Validation Subdomain**: Corrected the DKIM lookup mechanism to query the `default._domainkey` subdomain instead of the root domain.
- **DKIM Selector Formats**: Added advanced input parsing for DKIM checks. Users can now input `domain:selector` (e.g., `mxtoolbox.com:email`) or `selector._domainkey.domain` to query specific DKIM keys directly.
- **DKIM UI Logic**: The DKIM row now only appears if a valid record is found, displaying a clean success checkmark (✓) instead of raw text, providing a minimalist and focused status indicator.
- **DNS Record Filtering**: Enhanced the DNS results renderer to filter out DKIM-related records from the general TXT results block, preventing duplicate information display.
- **Tab Hover Bug**: Fixed a visual glitch where the top navigation tabs appeared darker than intended when hovered or selected, by switching the hover overlay from a static black overlay to the dynamic theme secondary background color.

## [0.9.11] — 2026-05-11

### Security
- **XSS Prevention in PICS**: All user/server-controlled URLs in the PICS tab (previews, uploads, history grid) are now escaped via `Utils.escapeHTML` to prevent DOM-based XSS.
- **XSS Prevention in DNS**: Input and API outputs in the DNS tab (including error messages, IP addresses, and geolocation variables) are escaped before DOM insertion.
- **Selector Injection Protection**: Upgraded tab rendering with `CSS.escape` around tab names to prevent potential selector injection vectors from chrome local storage.

### Improved
- **DNS Lookup Performance**: Eliminated redundant nested `Settings.load()` calls inside `Api.dnsQuery()`, reducing chrome storage reads from 7 to exactly 1 per query.
- **Settings Integrity**: Refactored the settings panel to retrieve a fresh settings object immediately before saving, preventing stale passgen configurations from being overwritten.
- **Deep Merge Settings**: Enhanced `core/settings.js` load logic to deep-merge nested configurations (`passgen`, `dnsQueries`), preventing default sub-keys from being lost during partial loads.
- **PICS Tab DOM Cache**: Cached the `picsTab` DOM element to eliminate repeated query cycles across handlers, and migrated storage targets to use `Config.storage` variables.
- **Debounced Save Stability**: Fixed notes save routine to trigger cleanly without unused parameters.
- **Password Generator Behavior**: Password is now generated once on notes tab activation rather than resetting on every single tab switch.
- **Code Quality and Cleanup**: Added missing `'clear'` translation key, removed unused iteration arguments in `noteItem` mapping, documented theme-init duplication context, and added comments detailing popup bootstrap steps.

## [0.9.10] — 2026-05-10

### Fixed
- **Note Editing Painting Glitch**: Resolved a Blink browser engine rendering issue where a note's custom background reverted to default on element replacement (`outerHTML`) in `startEditing` until hovered. Now, inline CSS properties and variables are forcefully pushed directly via JavaScript CSSOM to ensure immediate color applying.
- **Focus Background Reset**: Fixed a bug where clicking inside a custom-colored note's textarea (placing the cursor) reset the background to the standard theme background. Introduced a specific `.note-edit-input:focus` selector in `styles/features.css` that overrides the global `textarea:focus` rule and holds the custom `--note-bg` color while active.

## [0.9.9] — 2026-05-10

### Added
- **Expanded Theme Swatches**: Added 11 brand-new, high-quality theme palettes (including Sand, Breeze, Autumn, Navy, Blood, Monochrome, Terminal, Amber, Midnight, Synthwave, and Neon Cyan), bringing the total library to 29 beautifully curated options.
- **Organized Swatch Groups**: Structured the scrolling swatch palette in `popup.html` into 4 cohesive groups (Light, Dark/Brown, Colorful Dark, Neon/Retro) sorted by hue and tone for an incredibly smooth visual selection flow.
- **English Hover Fallbacks**: Translated all raw theme and toggle button `title` attributes in `popup.html` to English, establishing robust fallback tooltips if localization elements fail to render. Dynamic Ukrainian translations are applied dynamically via `core/i18n.js` mapping.

### Improved
- **Decoupled Theme Architecture**: Fully refactored `styles/base.css` to extract theme color mappings into a clean, standalone `styles/themes.css` stylesheet, dramatically simplifying future additions and enhancing design isolation.
- **Dynamic Theme Switching**: Upgraded `core/theme.js` to dynamically search and strip all `theme-*` class tokens on the root document element rather than relying on a hardcoded dict, enabling seamless, instant theme switches in any sequence without requiring a reload.

### Fixed
- **Note Action Buttons Contrast**: Overhauled note items and color picker rendering in `features/notes/notes-renderer.js` and `styles/features.css` using modern CSS custom properties (`--note-bg`, `--note-text`, etc.). Note action panels, shadows, and control buttons now dynamically inherit the note's custom background, fully eliminating visibility bugs (like black-on-dark buttons) when applying custom colors under dark themes.

## [0.9.8] — 2026-05-10

### Added
- **Configurable DNS Queries**: Introduced checkboxes in the Settings tab enabling users to select which records (`A`, `AAAA`, `MX`, `NS`, `TXT`, `SPF`, `DKIM`, `DMARC`) the extension queries. Unchecked queries are completely bypassed, preventing redundant DoH API network requests.
- **DKIM Validation Checkmark**: Added dedicated validation for DKIM root TXT records. If configured, a green checkmark (✓) is displayed along with record details; otherwise, a clean helper cross (✕) is shown.
- **Dedicated SPF Status**: Structured SPF records into their own row inside DNS results with clear validation formatting.

### Improved
- **Full-Width Notes Layout**: Overhauled Note list item elements to let text span the full 100% width. Action buttons (move, edit, delete) now float absolutely in the top-right corner on hover, using a matching background blend-shadow to overlay gracefully on top of the text.
- **Popup Height Calculation Fix**: Adjusted body container height formula (`calc(var(--cached-height, 600px) - 20px)`) to account for top and bottom margins, ensuring that when utilizing minimum height, the bottom margin and contents are never clipped.

## [0.9.7] — 2026-05-09

### Added
- **Dynamic Note Auto-Resizing**: Notes input textareas (both for adding and editing) now automatically stretch and shrink to match the content length. Added `+ 2px` border-box offset to guarantee flicker-free resizing.
- **Escape Key Cancel Shortcut**: Added keyboard support for note editing—hitting `Escape` instantly cancels note editing and renders the note list.
- **Cancel Button**: Integrated a modern SVG Cancel (`✕`) button into the note-editing interface.
- **NOTES Active Refresh**: Switching to the NOTES tab automatically regenerates a new strong password instantly.

### Improved
- **Robust API Query Timeouts**: Implemented an async `fetchWithTimeout` helper with a timeout of 4000ms/15000ms to prevent infinite loading state spinners if external services hang.
- **Optimized Crypto Password Generator**: Refactored the secure password generator buffer allocation to request multiple random bytes at once rather than 1 byte sequentially, reducing Cryptography API context-switching overhead.
- **Secure Configuration Import**: Strengthened data backup reliability by strictly filtering the imported JSON settings schema to only allow authorized keys (`lilo_settings`, `lilo_notes`, etc.), preventing extension memory contamination.
- **Sleeker PICS Clipboard and Drag/Drop Flow**: Unblocked standard clipboard functions (`Ctrl+C`, `Ctrl+A`) specifically inside text input elements under the PICS tab. Added global window prevention layers on `dragover` and `drop` events to prevent browser window hijacking if files are dropped outside the drop zone.

### Fixed
- **DNS MX Mail Server Domain Resolving**: Sanitized the trailing dot (`.`) character frequently appended to standard MX record lookups to ensure subsequent A-record resolving queries are completely compatible with DoH providers.
- **CSS Flexbox Textarea Height Constraint**: Overrode `flex: 1` height priority with `flex: none` on the edit note textarea, unlocking full dynamic height resizing within vertical flex grids.

## [0.9.6] — 2026-05-09
 
### Improved
- **Modern Minimalist SVGs**: Replaced all interface emojis (gear, lock, globe, profile, warnings, clipboard, arrows, sparkles, sun, moon, trash, etc.) with elegant, lightweight inline SVG vector icons that perfectly scale and adapt to all 18 theme palettes.
- **Enhanced Alignments**: Programmed perfect flex-alignment for warning symbols, labels, and text across tabs to ensure a completely symmetric, premium user experience.
 
## [0.9.5] — 2026-05-08
 
### Added
- **Expanded Theme Library**: Added 4 more modern premium themes (Sakura, Solarized Light, Solarized Dark, and Oceanic), bringing the total selection of highly curated UI palettes to 18.
- **Visual Swatch Accent Indicator**: Integrated a small, elegant colored dot inside each theme swatch circle displaying its unique primary accent color for a quick visual preview of the combined palette.
 
### Fixed
- **Complete Internationalization (I18n) Compliance**: Replaced all remaining hardcoded Ukrainian strings across modules (including settings confirm modals, clipboard copy badges, placeholder inputs, list empty messages, and drag-and-drop/offline warning text) with fully translated equivalents.
- **UI Contrast Optimization**: Replaced hardcoded white text for the primary DIG button with a dynamic `--accent-text` color custom-property to guarantee perfect readability and high contrast on both light-background and bright-background themes (e.g., Forest, Cyberpunk, Sea).
 
## [0.9.4] — 2026-05-08

### Added
- **PICS Drag & Drop & Upload History**: You can now drop image files directly into the upload area or click to open the file picker. Added a local image preview during uploads, and a grid showing the 5 most recently uploaded images (clicking them copies their URL instantly).
- **Password Strength Meter**: A colored dynamic visual meter evaluates password complexity in real-time under the generator output.
- **Note Customization**: Notes can now be reordered with sleek SVG arrows (▲/▼) and highlighted with 5 lovely pastel background colors. The text and icons dynamically adjust to dark-grey on colored notes for maximum readability.
- **Fast Tab Shortcuts**: Navigate between extension panels instantly with `Alt+1` (DNS), `Alt+2` (PICS), `Alt+3` (NOTES), and `Alt+4` (Settings).
- **IPv6 DNS Lookup**: Domain checks now query `AAAA` records in parallel and output them cleanly in their own IPv6 results block.
- **Offline Resilience**: Instant `navigator.onLine` verification cuts network requests early if offline, showing helpful warning messages instead of loading endlessly.

### Improved
- **Sliding Tab Accent**: Implemented a smooth sliding background animation behind active tabs.
- **Clean Button Grids**: Redesigned the data management buttons in settings into structured rows.
- **Full Localization**: The shortcut navigation guides and the PICS upload history sections now dynamically adjust to your language settings.

## [0.9.3] — 2026-05-08

### Added
- **Password Generator Preferences**: The extension now remembers your preferred password length and character set configurations across sessions.
- **Data Management Hub**: Introduced a new settings section to Export, Import, Reset, and Clear all extension data (including notes and preferences).
- **Toast Notifications**: Added non-intrusive popup notifications to provide feedback for saving, exporting, and clearing data.
- **Window Height Caching**: Implemented startup height caching (`lilo_height_cache`) via a CSS variable `--cached-height` to completely eliminate layout shift (flickering) during popup initialization.

### Improved
- **Organized Theme Palette**: Sorted the Zen palette color swatches into a beautiful, flowing gradient from lightest (left) to darkest (right) for a more premium visual flow.
- **Removed Secret PICS Commands**: Completely retired the `GETPICS`/`NOPICS` hidden command mechanics. The PICS image upload utility is now fully unlocked and visible by default to all users for better accessibility.
- **Premium Dropdowns**: Replaced default browser select elements with custom-styled, elegant dropdown menus matching the theme.
- **Robust Domain Cleaning**: Enhanced domain sanitization to strip port numbers (e.g., `domain:8080`), preventing invalid DNS lookup errors.
- **Stricter IPv4 Validation**: Implemented a stricter regex in `isValidIP` to eliminate invalid IP ranges.
- **Modern Chrome API Calls**: Refactored `getActiveTabDomain` to natively use modern async/await for `chrome.tabs.query` instead of Promise wrappers.
- **Enhanced DNS Resilience**: Replaced `Promise.all` with `Promise.allSettled` for batch DNS queries, ensuring a partial record failure (e.g., TXT record) does not block the entire lookup.
- **API Error Handling**: Added HTTP status checks in `fetch` calls to gracefully handle non-JSON or server error responses.

## [0.9.2] — 2026-05-04

### Security
- **XSS Protection**: Fixed a "DOM text reinterpreted as HTML" vulnerability in the i18n module. Replaced unsafe `innerHTML` assignments with a robust logic using `DOMParser` for HTML strings and `textContent` for plain text.

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
