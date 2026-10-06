# Privacy Policy for LILO Tools

**LILO Tools** is designed with user privacy as a fundamental principle.

### 1. No Data Collection

We **do not collect, store, or transmit** any personal data, browsing history, or private information. Notes and DNS/PICS history are stored locally in your browser (`chrome.storage.local` / `localStorage`) and never leave your device. Settings are stored in `chrome.storage.sync`, so if Chrome Sync is enabled, Google syncs them between your own browsers; the developer has no access to them.

### 2. Third-Party Services

LILO Tools integrates with third-party APIs solely to provide core functionality:

- **DNS Lookup**: Queries are sent directly to the selected provider (Google Public DNS or Cloudflare DNS) depending on your settings.
- **SSL Certificate Checking**: Requests are sent to `api.cert.ist`.
- **WHOIS Expiry**: The domain name is sent to `who-dat.as93.net`.
- **IP Geolocation**: Resolved IP addresses are sent to the selected provider: `ipwho.is` (default), `ipinfo.io`, or `ip-api.com` (HTTP, only after you grant the optional permission).
- **Image Uploads (PICS)**: If you choose to upload an image, it is uploaded to `freeimage.host`. Please **do not upload private or sensitive images**, as they are stored on external public servers.

**About the freeimage.host API key:** the key in `config.js` is a public, shared key for anonymous uploads to freeimage.host. It is not a secret, is not tied to your identity, and grants no access to your data or anyone else's account.

### 3. Permissions

The extension requests only the minimum permissions required to perform its functions:

- `storage`: To save your notes, settings, and local history.
- `activeTab`: To read the domain of the current tab **only when you open the extension**, so the DNS tab can pre-fill it. No browsing history is read or stored.
- Host permissions: only the API endpoints listed above. `ip-api.com` is optional and requested only if you select it.

### 4. Changes to this Policy

Any future updates to this privacy policy will be documented here. Your continued use of the extension constitutes acceptance of these terms.

---

*If you have any questions or feedback, feel free to reach out via the [Feedback page](https://feedback.iswappp.com/lilo-extension).*
