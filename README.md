# LILO Tools 🌍

**LILO Tools** is a multifunctional Chrome extension designed for webmasters, developers, and power users. It combines essential tools for DNS checking, image uploading, note-taking, and password generation.

## ✨ Key Features

- **DNS Checker**: Quick analysis of DNS records (A, AAAA/IPv6, MX, TXT, NS) with automatic IP geolocation and MX host resolution.
- **Image Upload (PICS)**: Drop images directly into the popup, paste screenshots from your clipboard, or select a file. Shows a visual loading preview and keeps a history of the 5 most recent uploads with single-click copying.
- **Notes & Customization**: Convenient note-taking directly in your browser. Reorder notes with sleek up/down arrows and highlight them with gentle pastel background colors.
- **Password Generator**: Create secure, cryptographically strong passwords with one-click copying and a dynamic colored complexity strength meter.
- **Fast Navigation Shortcuts**: Quickly jump between extension tabs using hotkeys: `Alt+1` (DNS), `Alt+2` (PICS), `Alt+3` (NOTES), or `Alt+4` (Settings).
- **Multi-Theme UI**: Choose between 11+ unique color palettes (Matcha, Peach, Lavender, Nord, etc.) using a modern, horizontal-scrolling palette picker inspired by Zen Browser.
- **Localization**: Full support for English and Ukrainian languages across all features.
- **Smart Copying & Offline Resilience**: Copy results instantly without metadata. Requests check connectivity beforehand using `navigator.onLine` to avoid hanging.
- **Zen Style Palette**: A convenient theme switcher with dedicated toggles for System/Light/Dark modes and a scrollable color gallery.
- **High Performance**: Optimized startup with synchronous theme detection to prevent UI flickering.

## 🛠 Technologies

- **Manifest V3**
- **Vanilla JavaScript (ES Modules)**
- **CSS3 (Custom Properties, Flexbox, Transitions)**
- **Chrome Storage API**

## ⚙️ Settings

- **Startup Tab**: You can choose which tab opens by default — the last opened one or a specific fixed tab.
- **DNS Provider**: Toggle between Google (8.8.8.8) and Cloudflare (1.1.1.1).
- **Zen Color Palette**: Pick from a wide range of eye-friendly themes ordered from light to dark (Paper, Peach, Matcha, Lavender, Nord, Sunset, Coffee, Forest, Cyberpunk, Sea) using the new interactive switcher.
- **Window Height**: Easily adjust the height of the popup directly in settings.

## 📦 Installation

1. Download the repository.
2. Open `chrome://extensions/` in your browser.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `LILO` folder.
