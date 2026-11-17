// Loaded only on the admin (/keystatic), by src/middleware.ts.
//
// Keystatic Cloud saves everything in one request: the YAML plus every new photo, base64-encoded.
// A photo straight from a phone camera is often 5 to 15 MB, so that request gets very large and
// mobile Safari drops it ("[Network] Load failed"). This shrinks a picked photo in the browser
// before Keystatic reads it: at most 2560 px on the long side (the site never shows a photo wider
// than 2400 px), as a JPEG. Small photos, GIFs and SVGs are left as they are.
//
// Keystatic picks a file with a hidden <input type="file"> and reads it in `input.onchange`. A
// capture listener on window runs first, holds that event back, swaps in the smaller file, and
// fires `change` again.
const MAX_SIDE = 2560;
const QUALITY = 0.85;
const MIN_BYTES = 1024 * 1024;
const done = new WeakSet();

window.addEventListener(
  'change',
  (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
    if (done.has(input)) {
      done.delete(input);
      return;
    }
    const file = input.files?.[0];
    if (!file || !/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return;
    event.stopImmediatePropagation();
    shrink(file)
      .catch(() => file)
      .then((result) => {
        if (result !== file) {
          const list = new DataTransfer();
          list.items.add(result);
          input.files = list.files;
        }
        done.add(input);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
  },
  true,
);

async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= MIN_BYTES) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    // A PNG with transparency would otherwise turn black where it is see-through.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } finally {
    URL.revokeObjectURL(url);
  }
}
