// features/pics/pics-renderer.js — HTML rendering for PICS results.

export const PicsRenderer = {
  loading() {
    return '<div class="loader"></div><p>Uploading to host...</p>';
  },

  success(url) {
    return `
      <div class="img-result">
        <p class="img-success">✅ Copied!</p>
        <img src="${url}" alt="Uploaded">
        <input value="${url}" readonly class="img-url-input">
      </div>`;
  },

  error() {
    return '<div class="msg error">❌ Upload failed</div>';
  },
};
