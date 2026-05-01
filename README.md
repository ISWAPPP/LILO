# LILO Tools 🌍

**LILO Tools** is a multifunctional Chrome extension designed for webmasters, developers, and power users. It combines essential tools for DNS checking, image uploading, note-taking, and password generation.

## ✨ Key Features

- **DNS Checker**: Quick analysis of DNS records (A, MX, TXT, NS) with automatic IP geolocation and MX host resolution.
- **Image Upload**: Instant screenshot uploading from clipboard to third-party hosting (PICS) with a 10MB limit.
- **Notes**: Convenient storage for text snippets directly in your browser.
- **Password Generator**: Create secure, cryptographically strong passwords with one-click copying.
- **Multi-Theme UI**: Choose between Light, Dark, Forest, Paper, and Sea themes, or use Auto-mode.
- **Localization**: Full support for English and Ukrainian languages.
- **Smart Copying**: Click-to-copy results that intelligently exclude visual metadata like geolocation.
- **Flexible Settings**: Choose your preferred language, startup tab, theme, and DNS provider.

## 🛠 Technologies

- **Manifest V3**
- **Vanilla JavaScript (ES Modules)**
- **CSS3 (Custom Properties, Animations)**
- **Chrome Storage API**

## ⚙️ Settings & Secrets

- **Startup Tab**: You can choose which tab opens by default — the last opened one or a specific fixed tab.
- **DNS Provider**: Toggle between Google (8.8.8.8) and Cloudflare (1.1.1.1).
- **Custom Themes**: A variety of eye-friendly themes (Light, Dark, Forest, Paper, Sea) to suit your environment.
- **Secret PICS Tab**: By default, the image upload tab is hidden.
  - To **enable** it: type `GETPICS` in the note input field and click +.
  - To **disable** it: type `NOPICS` in the note input field and click +.

## 📦 Installation

1. Download the repository.
2. Open `chrome://extensions/` in your browser.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `LILO` folder.
