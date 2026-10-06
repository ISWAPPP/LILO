// features/passgen/passgen.js — password generator inside the NOTES tab.

import { Config } from '../../config.js';
import { Utils } from '../../core/utils.js';
import { Settings } from '../../core/settings.js';

/** Pure: builds a password from { lower, upper, numbers, symbols, excludeSimilar, length }. */
export function generatePassword(opts) {
  const cfg = Config.passgen;
  let charset = ['lower', 'upper', 'numbers', 'symbols'].filter(k => opts[k]).map(k => cfg.charsets[k]).join('');
  if (opts.excludeSimilar) {
    const similar = new Set(cfg.similarChars);
    charset = [...charset].filter(ch => !similar.has(ch)).join('');
  }
  if (!charset) {
    charset = cfg.charsets.lower; // Fallback
  }

  const length = opts.length || cfg.defaultLength;
  // Rejection sampling over random bytes avoids modulo bias.
  const maxValid = 256 - (256 % charset.length);
  const array = new Uint8Array(Math.max(length * 2, 64));
  let bufferIndex = array.length;
  let generatedPass = '';
  while (generatedPass.length < length) {
    if (bufferIndex >= array.length) {
      crypto.getRandomValues(array);
      bufferIndex = 0;
    }
    const val = array[bufferIndex++];
    if (val < maxValid) {
      generatedPass += charset[val % charset.length];
    }
  }
  return generatedPass;
}

function calculateStrength(password, opts) {
  let score = 0;
  if (password.length >= 6) {
    score += 1;
  }
  if (password.length >= 10) {
    score += 1;
  }
  if (password.length >= 14) {
    score += 1;
  }
  
  let variety = 0;
  if (opts.lower) {
    variety++;
  }
  if (opts.upper) {
    variety++;
  }
  if (opts.numbers) {
    variety++;
  }
  if (opts.symbols) {
    variety++;
  }
  
  if (variety >= 3) {
    score += 1;
  }
  if (variety === 4) {
    score += 1;
  }

  const meter = document.getElementById('passgen-strength-meter');
  if (!meter) {
    return;
  }

  meter.className = 'passgen-strength-meter'; // reset
  if (password.length === 0) {
    // do nothing
  } else if (score <= 2) {
    meter.classList.add('weak');
  } else if (score <= 3) {
    meter.classList.add('medium');
  } else if (score <= 4) {
    meter.classList.add('strong');
  } else {
    meter.classList.add('very-strong');
  }
}

function readOptions() {
  const checked = id => document.getElementById(id)?.checked;
  return {
    lower: checked('opt-lower'),
    upper: checked('opt-upper'),
    numbers: checked('opt-numbers'),
    symbols: checked('opt-symbols'),
    excludeSimilar: checked('opt-no-similar'),
    length: parseInt(document.getElementById('passgen-length')?.value, 10) || Config.passgen.defaultLength,
  };
}

function refreshPassword() {
  const output = document.getElementById('passgen-result');
  if (output) {
    const opts = readOptions();
    output.value = generatePassword(opts);
    calculateStrength(output.value, opts);
  }
}

/** Binds generator controls and restores saved options. */
export function initPassgen() {
  const elLower = document.getElementById('opt-lower');
  const elUpper = document.getElementById('opt-upper');
  const elNum = document.getElementById('opt-numbers');
  const elSym = document.getElementById('opt-symbols');
  const elNoSimilar = document.getElementById('opt-no-similar');
  const lengthSlider = document.getElementById('passgen-length');
  const lengthVal = document.getElementById('passgen-length-val');

  const savePassgenSettings = async () => {
    const current = await Settings.load();
    await Settings.save({
      ...current,
      passgen: {
        lower: elLower?.checked,
        upper: elUpper?.checked,
        numbers: elNum?.checked,
        symbols: elSym?.checked,
        excludeSimilar: elNoSimilar?.checked,
        length: parseInt(lengthSlider?.value, 10) || 16
      }
    });
  };

  // Password generator events
  const passgenOptions = ['opt-lower', 'opt-upper', 'opt-numbers', 'opt-symbols', 'opt-no-similar'];
  passgenOptions.forEach(optId => {
    document.getElementById(optId)?.addEventListener('change', () => {
      savePassgenSettings();
      refreshPassword();
    });
  });

  if (lengthSlider) {
    lengthSlider.addEventListener('input', () => {
      if (lengthVal) {
        lengthVal.textContent = lengthSlider.value;
      }
      refreshPassword();
    });
    // Save once on release: chrome.storage.sync allows ~120 writes/minute.
    lengthSlider.addEventListener('change', savePassgenSettings);
  }

  // Click on password = copy (like notes)
  const passgenResult = document.getElementById('passgen-result');
  passgenResult?.addEventListener('click', async () => {
    if (!passgenResult.value) {
      return;
    }
    const ok = await Utils.copyToClipboard(passgenResult.value);
    if (ok) {
      const section = passgenResult.closest('.passgen-section');
      section?.classList.add('copied');
      setTimeout(() => section?.classList.remove('copied'), 800);
    }
  });

  document.getElementById('passgen-refresh')?.addEventListener('click', refreshPassword);

  Settings.load().then((settings) => {
    // Show/hide password generator based on setting
    const passgenSection = document.querySelector('.passgen-section');
    if (passgenSection) { passgenSection.style.display = settings.passgenEnabled !== false ? '' : 'none'; }

    const pg = settings.passgen;
    if (elLower) { elLower.checked = pg.lower; }
    if (elUpper) { elUpper.checked = pg.upper; }
    if (elNum) { elNum.checked = pg.numbers; }
    if (elSym) { elSym.checked = pg.symbols; }
    if (elNoSimilar) { elNoSimilar.checked = pg.excludeSimilar; }
    if (lengthSlider) { lengthSlider.value = pg.length; }
    if (lengthVal) { lengthVal.textContent = pg.length; }
    refreshPassword();
  });
}
