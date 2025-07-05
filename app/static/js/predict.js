// predict.js – smart status + confidence + anti‑flicker + button sync

/* Elements -------------------------------------------------- */
const video       = document.getElementById('video');
const toggleBtn   = document.getElementById('toggleCam');
const resultSpan  = document.querySelector('.prediction-value');
const fpsSpan     = document.getElementById('fps');
const confFill    = document.getElementById('confidenceFill');
const confText    = document.getElementById('confidenceText');
const overlayBox  = document.getElementById('videoOverlay');
const statusDot   = document.querySelector('.status-indicator');
const statusMsg   = document.querySelector('.status-text');
const btnText     = toggleBtn.querySelector('.btn-text');
const btnIcon     = toggleBtn.querySelector('i');

/* Globals --------------------------------------------------- */
let stream   = null;
let timerID  = null;
let frames   = 0;
let lastPred = '-';
let missCnt  = 0;
const MAX_MISS = 3;
const POLL_MS  = 150;

/* Camera control ------------------------------------------- */
async function openCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    await video.play();

    video.style.display = 'block';
    overlayBox.classList.add('hidden');
    statusDot.classList.add('active');
    statusMsg.textContent = 'Camera Active';

    // Update button UI
    btnText.textContent = 'Close Camera';
    btnIcon.classList.replace('fa-play', 'fa-stop');

    startPredictLoop();
  } catch (err) {
    console.error(err);
    alert('Camera error: ' + err.message);
  }
}

function closeCamera() {
  if (timerID) {
    clearInterval(timerID);
    timerID = null;
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  video.srcObject = null;
  video.style.display = 'none';
  overlayBox.classList.remove('hidden');
  statusDot.classList.remove('active');
  statusMsg.textContent = 'Camera Off';

  // Reset button UI
  btnText.textContent = 'Start Detection';
  btnIcon.classList.replace('fa-stop', 'fa-play');

  resetDisplay();
}

toggleBtn.addEventListener('click', () => {
  stream ? closeCamera() : openCamera();
});

/* Predict loop --------------------------------------------- */
function startPredictLoop() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let t0 = performance.now();

  timerID = setInterval(async () => {
    if (!stream) return;

    if (!canvas.width) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataURL })
      });
      const json = await res.json();
      updatePrediction(json);
    } catch (err) {
      console.error('Prediction error:', err);
    }

    // FPS calculation
    frames++;
    const now = performance.now();
    if (now - t0 >= 1000) {
      fpsSpan.textContent = frames;
      frames = 0;
      t0 = now;
    }
  }, POLL_MS);
}

/* Update UI ----------------------------------------------- */
function updatePrediction({ prediction, confidence }) {
  const hasHand = prediction && prediction !== '-' && prediction !== 'None';

  if (hasHand) {
    lastPred = prediction;
    missCnt = 0;
  } else {
    missCnt++;
  }

  if (missCnt >= MAX_MISS) {
    resultSpan.textContent = 'No hand detected';
    confFill.style.width = '0%';
    confText.textContent = '';
  } else {
    resultSpan.textContent = lastPred;
    if (confidence !== undefined) {
      const pct = Math.round(confidence);
      confFill.style.width = pct + '%';
      confText.textContent = pct + '%';
    }
  }
}

function resetDisplay() {
  resultSpan.textContent = '-';
  fpsSpan.textContent = '--';
  confFill.style.width = '0%';
  confText.textContent = '';
  lastPred = '-';
  missCnt = 0;
}

// Optional: Auto open
// openCamera();
