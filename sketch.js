// Hand Gesture Resizer.
// Webcam hand tracking (ml5.js) drives the size of a single circle:
// pinch the index finger against the thumb to grow it, open your hand
// to shrink it. Frames are processed in memory only; nothing is stored.

// MediaPipe reports 21 landmarks per hand, wrist first. Landmark 4 is the
// thumb tip and landmark 8 is the index finger tip.
const LANDMARK_COUNT = 21;
const THUMB_TIP_INDEX = 4;
const INDEX_TIP_INDEX = 8;

// Circle behavior.
const MIN_SIZE = 40;
const MAX_SIZE = 520;
const SMOOTHNESS = 0.18;

// Gesture behavior.
const PINCH_RANGE = 70; // pixels: thumb and index almost touching
const DARK = [18, 18, 24];

let handpose;
let webcam;
let targetSize = MIN_SIZE;
let size = MIN_SIZE; // smoothed every frame toward the target

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create the webcam element and request camera permission.
  webcam = document.createElement('video');
  webcam.setAttribute('playsinline', 'true');
  webcam.setAttribute('autoplay', 'true');
  webcam.setAttribute('muted', 'true');

  // Small camera preview shown in the top-left corner.
  webcam.style.position = 'absolute';
  webcam.style.top = '10px';
  webcam.style.left = '10px';
  webcam.style.width = '160px';
  webcam.style.height = '120px';
  webcam.style.border = '2px solid #fff';
  webcam.style.borderRadius = '8px';
  webcam.style.background = '#000';
  webcam.style.zIndex = '10';
  document.body.appendChild(webcam);

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      webcam.srcObject = stream;
      handpose = ml5.handpose(webcam, onModelReady);
    })
    .catch((err) => {
      console.error('Camera access denied or unavailable:', err);
      alert(
        'No se pudo acceder a la cámara. Permite el uso de la cámara cuando el navegador lo pida. Si abres el archivo directamente (file://), algunos navegadores exigen servir la carpeta con un servidor local (por ejemplo `python -m http.server`).'
      );
    });
}

function onModelReady() {
  handpose.addEventListener('predictions', onPredictions);
}

function onPredictions(predictions) {
  let pinch = false;
  for (let i = 0; i < predictions.length; i++) {
    const data = landmarkData(predictions[i]);
    if (!isUsable(data)) {
      continue;
    }
    pinch = isPinch(data);
    break; // one hand is enough to drive the circle
  }
  targetSize = pinch ? MAX_SIZE : MIN_SIZE;
}

function landmarkData(prediction) {
  // ml5 exposes the landmarks under `data`; some versions use `landmarks`.
  if (prediction && prediction.data) {
    return prediction.data;
  }
  if (prediction && prediction.landmarks) {
    return prediction.landmarks;
  }
  return null;
}

function isPinch(data) {
  const thumbTip = fingertip(data, THUMB_TIP_INDEX);
  const indexTip = fingertip(data, INDEX_TIP_INDEX);
  if (thumbTip === null || indexTip === null) {
    return false;
  }
  const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
  return distance < PINCH_RANGE;
}

function isUsable(data) {
  if (!data || data.length < LANDMARK_COUNT * 2) {
    return false;
  }
  for (let i = 0; i < LANDMARK_COUNT * 2; i++) {
    if (!Number.isFinite(data[i])) {
      return false;
    }
  }
  return true;
}

function fingertip(data, landmarkIndex) {
  const x = data[landmarkIndex * 2];
  const y = data[landmarkIndex * 2 + 1];
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return { x: x, y: y };
}

function draw() {
  background(DARK);
  size = lerp(size, targetSize, SMOOTHNESS);
  fill(255, 176, 64);
  noStroke();
  ellipse(width / 2, height / 2, size);
  textAlign(CENTER, CENTER);
  fill(200);
  text('Open your hand to shrink; pinch to grow', width / 2, 30);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
