# LILO Tools 🌍

**LILO Tools** is a multifunctional Chrome extension designed for webmasters, developers, and power users. It combines essential tools for DNS checking, image uploading, note-taking, and password generation.

## ✨ Key Features

- **DNS Checker**: Quick analysis of DNS records (A, MX, TXT, NS) with automatic IP geolocation and MX host resolution.
- **Image Upload**: Instant screenshot uploading from clipboard to third-party hosting (PICS) with a 10MB limit.
- **Notes**: Convenient storage for text snippets directly in your browser, now truncated to two lines for a compact view.
- **Password Generator**: Create secure, cryptographically strong passwords with one-click copying.
- **Multi-Theme UI**: Choose between 11+ unique color palettes (Matcha, Peach, Lavender, Nord, etc.) using a modern, horizontal-scrolling palette picker inspired by Zen Browser.
- **Localization**: Full support for English and Ukrainian languages.
- **Smart Copying**: Click-to-copy results that intelligently exclude visual metadata like geolocation.
- **Flexible Settings**: Choose your preferred language, startup tab, DNS provider, and customize the extension's window height.
- **Zen Style Palette**: A convenient theme switcher with dedicated toggles for System/Light/Dark modes and a scrollable color gallery.
- **High Performance**: Optimized startup with synchronous theme detection to prevent UI flickering.

## 🛠 Technologies

- **Manifest V3**
- **Vanilla JavaScript (ES Modules)**
- **CSS3 (Custom Properties, Flexbox, Transitions)**
- **Chrome Storage API**

## ⚙️ Settings & Secrets

- **Startup Tab**: You can choose which tab opens by default — the last opened one or a specific fixed tab.
- **DNS Provider**: Toggle between Google (8.8.8.8) and Cloudflare (1.1.1.1).
- **Zen Color Palette**: Pick from a wide range of eye-friendly themes (Matcha, Peach, Lavender, Nord, Forest, Paper, Sea, Sunset, Cyberpunk, Coffee) using the new interactive switcher.
- **Window Height**: Easily adjust the height of the popup directly in settings.
- **Secret PICS Tab**: By default, the image upload tab is hidden.
  - To **enable** it: type `GETPICS` in the note input field and click +.
  - To **disable** it: type `NOPICS` in the note input field and click +.

## 📦 Installation

1. Download the repository.
2. Open `chrome://extensions/` in your browser.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `LILO` folder.
