# Hand Gesture Resizer

A tiny browser app that uses your webcam and the [ml5.js](https://ml5js.org) handpose model to
resize a circle with a pinch.

## Quick path

1. Open `index.html` in a modern browser, or serve this folder and open the page.
2. Allow camera access when the browser asks.
3. Pinch your index finger against your thumb to grow the circle.
4. Open your hand to shrink it again.

## How it works

| Topic | Decision |
|-------|----------|
| Hand landmarks | ml5.js handpose reports 21 MediaPipe landmarks per hand, wrist first. |
| Pinch detection | Distance between the thumb tip (landmark 4) and the index tip (landmark 8) under 70 pixels. |
| Circle size | Grows to 520 pixels when pinching; shrinks back to 40 when the hand opens. Motion is smoothed. |

Frames are processed in memory only. Nothing is stored, and no audio or recording is used.

## Run it

Open `index.html` directly, or serve this folder (for example `python -m http.server`) and open the page in a browser.
