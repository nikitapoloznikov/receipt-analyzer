import { allReceipts, putPhoto, getPhoto, uuid, deleteReceipt } from '../lib/db.js';
import { newReceipt } from '../lib/receipt.js';
import { putReceipt } from '../lib/db.js';
import { fileToCompressedBlob, canvasToCompressedBlob, blobUrl } from '../lib/photo.js';
import { enqueue, subscribe } from '../lib/queue.js';
import { loadSettings } from '../lib/settings.js';
import { navigate } from '../router.js';

export async function renderCapture(root) {
  const settings = loadSettings();
  const hasKey = !!settings.claude_api_key;

  root.innerHTML = `
    <header class="topbar">
      <h1>Receipt Analyzer</h1>
      <a class="iconbtn" href="#/settings" aria-label="Settings">⚙</a>
    </header>
    ${!hasKey ? `
      <div class="banner banner--warn">
        No Claude API key set. <a href="#/settings">Open Settings</a> to add one before snapping.
      </div>
    ` : ''}
    <div class="capture-actions">
      <button class="bigbtn" id="cam-btn">
        <span class="bigbtn-icon">📷</span>
        <span class="bigbtn-label">Camera</span>
        <span class="bigbtn-sub">Snap now</span>
      </button>
      <label class="bigbtn">
        <span class="bigbtn-icon">🖼</span>
        <span class="bigbtn-label">Gallery</span>
        <span class="bigbtn-sub">Import photos</span>
        <input id="gallery-input" type="file" accept="image/*" multiple style="display:none">
      </label>
    </div>
    <section class="queue">
      <h2 class="queue-title">Queue <span id="queue-count" class="queue-count">0</span></h2>
      <div id="queue-grid" class="queue-grid"></div>
      <p class="muted small" id="queue-hint">Tap a receipt thumbnail to review and save.</p>
    </section>
  `;

  const camBtn = root.querySelector('#cam-btn');
  const galleryInput = root.querySelector('#gallery-input');
  const queueGrid = root.querySelector('#queue-grid');
  const queueCount = root.querySelector('#queue-count');
  const queueHint = root.querySelector('#queue-hint');

  const objectUrls = [];

  async function refreshQueue() {
    const all = await allReceipts();
    const visible = all
      .filter(r => r.status !== 'saved')
      .sort((a, b) => b.createdAt - a.createdAt);

    queueCount.textContent = visible.length;
    queueGrid.innerHTML = '';
    if (!visible.length) {
      queueHint.textContent = 'No receipts in queue.';
      return;
    }
    queueHint.textContent = 'Tap a receipt thumbnail to review and save.';

    for (const r of visible) {
      const tile = document.createElement('a');
      tile.className = 'qtile';
      tile.href = `#/receipt/${r.id}`;
      tile.dataset.id = r.id;
      const photo = await getPhoto(r.photo_blob_id);
      if (photo) {
        const url = blobUrl(photo.blob);
        objectUrls.push(url);
        tile.innerHTML = `
          <img src="${url}" alt="">
          <span class="qbadge qbadge--${r.status}">${badgeFor(r.status)}</span>
        `;
      } else {
        tile.innerHTML = `<div class="qmissing">missing</div>`;
      }
      queueGrid.appendChild(tile);
    }
  }

  function badgeFor(status) {
    if (status === 'parsing') return '⏳';
    if (status === 'parsed') return '✓';
    if (status === 'parse_failed') return '⚠️';
    return '·';
  }

  camBtn.addEventListener('click', () => openCamera(refreshQueue));
  galleryInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) await ingestFile(f);
    galleryInput.value = '';
    refreshQueue();
  });

  const unsubscribe = subscribe(() => refreshQueue());
  refreshQueue();

  return () => {
    unsubscribe();
    objectUrls.forEach(u => URL.revokeObjectURL(u));
  };
}

async function ingestFile(file) {
  const blob = await fileToCompressedBlob(file);
  const photoId = uuid();
  await putPhoto({
    id: photoId,
    blob,
    mime_type: 'image/jpeg',
    size_bytes: blob.size,
    created_at: Date.now()
  });
  const r = newReceipt({ photo_blob_id: photoId });
  await putReceipt(r);
  enqueue(r.id);
}

async function ingestBlob(blob) {
  const photoId = uuid();
  await putPhoto({
    id: photoId,
    blob,
    mime_type: 'image/jpeg',
    size_bytes: blob.size,
    created_at: Date.now()
  });
  const r = newReceipt({ photo_blob_id: photoId });
  await putReceipt(r);
  enqueue(r.id);
}

async function openCamera(onCapture) {
  const modal = document.createElement('div');
  modal.className = 'cam-modal';
  modal.innerHTML = `
    <video autoplay playsinline muted></video>
    <button class="cam-close" aria-label="Close">✕</button>
    <div class="cam-controls">
      <span class="cam-count" id="cam-count">0 snapped</span>
      <button class="cam-shutter" aria-label="Capture"></button>
      <span class="cam-spacer"></span>
    </div>
  `;
  document.body.appendChild(modal);

  const video = modal.querySelector('video');
  const closeBtn = modal.querySelector('.cam-close');
  const shutter = modal.querySelector('.cam-shutter');
  const counter = modal.querySelector('#cam-count');
  let stream;
  let snapped = 0;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 3000 }, height: { ideal: 3000 } },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    modal.remove();
    alert('Camera access denied or unavailable.\n\n' + err.message + '\n\nOn iOS: Settings → Safari → Camera → Allow.');
    return;
  }

  function close() {
    stream?.getTracks().forEach(t => t.stop());
    modal.remove();
    onCapture?.();
  }

  closeBtn.addEventListener('click', close);

  shutter.addEventListener('click', async () => {
    if (!video.videoWidth) return;
    shutter.classList.add('is-flash');
    setTimeout(() => shutter.classList.remove('is-flash'), 120);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const blob = await canvasToCompressedBlob(canvas);
    await ingestBlob(blob);
    snapped++;
    counter.textContent = `${snapped} snapped`;
    onCapture?.();
  });
}
