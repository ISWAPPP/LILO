// features/pics/pics-renderer.js — побудова HTML для PICS результатів.

export const PicsRenderer = {
  loading() {
    return '<div class="loader"></div><p>Надсилаємо на хостинг...</p>';
  },

  success(url) {
    return `
      <div class="img-result">
        <p class="img-success">✅ Скопійовано!</p>
        <img src="${url}" alt="Uploaded">
        <input value="${url}" readonly class="img-url-input">
      </div>`;
  },

  error() {
    return '<div class="msg error">❌ Помилка завантаження</div>';
  },
};
