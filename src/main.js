import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "@larrym/lz-string";

import "./style.css";
import "./font.css";

const editor = document.querySelector(".editor");
const container = document.querySelector(".container");
const envelope = document.querySelector(".envelope");
const letter = document.querySelector(".letter");

let maxRotation = 16;
let usingAccelerometer = false;

const debounce = (callback, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, args), delay);
  };
}

const defaultParams = {
  tt: "For you",
  sc: "antiquewhite",
  se: "💘",
  tx: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sit amet scelerisque nisl. Pellentesque urna mauris, accumsan eleifend ante quis, fringilla luctus felis. Quisque faucibus ut arcu pulvinar egestas. Etiam gravida risus at massa facilisis, id porttitor eros maximus. Nam blandit arcu eget magna gravida, id euismod tellus consectetur. Morbi ipsum diam, scelerisque eget vehicula id, molestie ut nunc. Sed molestie interdum odio, ullamcorper blandit arcu pretium vitae."
};

const hash = window.location.hash.slice(1);
const hashParams = JSON.parse(decompressFromEncodedURIComponent(hash));
const params = { ...defaultParams, ...hashParams };
for (const [key, value] of Object.entries(params)) {
  try {
    document.querySelector(`[data-field='${key}'`).value = value;
    document.querySelector(`[data-target='${key}'`).textContent = value;
  } catch (error) { }
}

const update = (event) => {
  if (event?.target) {
    const param = event.target.dataset.field;
    const value = event.target.value;
    console.log(param, value)
    if (param && value) {
      params[param] = value;
      try {
        document.querySelector(`[data-target='${param}'`).textContent = value;
      } catch (error) { }
    }
  }
  window.location.hash = compressToEncodedURIComponent(JSON.stringify(params));
}

update();

if (location.pathname === "/letter/") {
  editor.remove();
} else {
  document.getElementById("textarea-front").addEventListener("input", debounce(update, 500))
  document.getElementById("textarea-letter").addEventListener("input", debounce(update, 500))
  document.getElementById("button-preview").addEventListener("click", () => window.open("https://" + window.location.host + "/letter/" + window.location.hash))
  container.style.pointerEvents = "none";
}

const wait = async (millis) => new Promise((resolve) => setTimeout(resolve, millis))

const emojiToBase64 = (emoji, size = 64) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = size;
  canvas.height = size;
  context.font = `${size * 0.75}px Emoji`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const metrics = context.measureText(emoji);
  const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const y = size / 2 + (metrics.actualBoundingBoxAscent - textHeight / 2);
  context.fillText(emoji, size / 2, y);
  const dataURL = canvas.toDataURL("image/png");
  return dataURL;
}

const stampColor = params.sc;
const stampEmoji = params.se;

envelope.style.setProperty("--stamp-color", stampColor);
envelope.style.setProperty("--stamp", `url(${(emojiToBase64(stampEmoji))})`);

const animationOptions = {
  duration: 500,
  easing: "ease-in-out",
  fill: "forwards"
};

envelope.addEventListener("click", async (event) => {
  container.classList.add("flip");
  await wait(500);

  container.classList.add("open");
  await wait(500);

  const letterOutAnimation = letter.animate([{ transform: "translateY(-110%)" }], animationOptions);
  await letterOutAnimation.finished;

  envelope.parentNode.appendChild(letter)
  maxRotation = 2;

  container.classList.add("hidden");
  container.classList.remove("open");
  await wait(200);

  const letterInAnimation = letter.animate([{ transform: "translateY(0)" }], animationOptions);
  letter.classList.add("open");
  await letterInAnimation.finished;
})

const handleOrientation = (e) => {
  usingAccelerometer = !!e.alpha && !!e.beta && !!e.gamma;
  const beta = (e.beta - 45);
  const gamma = -e.gamma;
  const rotateX = Math.max(-maxRotation, Math.min(maxRotation, beta / 2));
  const rotateY = Math.max(-maxRotation, Math.min(maxRotation, gamma / 2));
  container.style.setProperty("--rotate-x", `${rotateX}deg`);
  container.style.setProperty("--rotate-y", `${rotateY}deg`);
}

const requestOrientationPermission = () => {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          info.textContent = 'Tilt your device to interact';
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

if (window.DeviceOrientationEvent) {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.addEventListener("click", requestOrientationPermission, { once: true });
  } else {
    requestOrientationPermission();
  }
}

document.addEventListener("mousemove", (e) => {
  if (usingAccelerometer) return;
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  const rotateY = (x - 0.5) * 2 * maxRotation;
  const rotateX = (y - 0.5) * -2 * maxRotation;
  container.style.setProperty("--rotate-x", `${rotateX}deg`);
  container.style.setProperty("--rotate-y", `${rotateY}deg`);
});

document.addEventListener("mouseleave", () => {
  if (usingAccelerometer) return;
  container.style.setProperty("--rotate-x", `0deg`);
  container.style.setProperty("--rotate-y", `0deg`);
});
