const textInput = document.getElementById("textInput");
const displayArea = document.getElementById("displayArea");
const header = document.getElementById("appTitle");

const fontWeightSlider = document.getElementById("fontWeightSlider");
const fontWeightValue = document.getElementById("fontWeightValue");
const lineHeightSlider = document.getElementById("lineHeightSlider");
const lineHeightValue = document.getElementById("lineHeightValue");
const fontSelector = document.getElementById("fontSelector");
const accentSelector = document.getElementById("accentSelector");

const copyButtons = document.querySelectorAll('[data-action="copy"]');
const clearButtons = document.querySelectorAll('[data-action="clear"]');
const resetButtons = document.querySelectorAll('[data-action="reset"]');
const actionButtons = document.querySelectorAll("[data-action]");

const initialState = {
  text: "",
  font: "'Noto Serif JP', serif",
  weight: "600",
  line: "1.4",
  color: "#00793d"
};

const root = document.documentElement;

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrast(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return luminance(r, g, b) > 0.5 ? "#000" : "#fff";
}

function getEdge(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return luminance(r, g, b) > 0.9 ? "#b8b8b8" : hex;
}

function applyAccent(color) {
  root.style.setProperty("--accent", color);
  root.style.setProperty("--accent-edge", getEdge(color));
  root.style.setProperty("--accent-contrast", getContrast(color));
}

function updateDisplay() {
  displayArea.textContent = textInput.value || "test";
}

function updateUI() {
  displayArea.style.fontWeight = fontWeightSlider.value;
  displayArea.style.lineHeight = lineHeightSlider.value;
  displayArea.style.fontFamily = fontSelector.value;
}

function saveToLocal() {
  const state = {
    text: textInput.value,
    font: fontSelector.value,
    weight: fontWeightSlider.value,
    line: lineHeightSlider.value,
    color: accentSelector.value
  };
  localStorage.setItem("textAppState", JSON.stringify(state));
}

function loadFromLocal() {
  const state = JSON.parse(localStorage.getItem("textAppState") || "{}");

  if (state.text) textInput.value = state.text;
  if (state.font) fontSelector.value = state.font;
  if (state.weight) fontWeightSlider.value = state.weight;
  if (state.line) lineHeightSlider.value = state.line;
  if (state.color) accentSelector.value = state.color;
}

function updateSlidersUI() {
  fontWeightValue.textContent = fontWeightSlider.value;
  lineHeightValue.textContent = lineHeightSlider.value;
}

textInput.addEventListener("input", () => {
  updateDisplay();
  saveToLocal();
});

fontWeightSlider.addEventListener("input", () => {
  updateSlidersUI();
  updateUI();
  saveToLocal();
});

lineHeightSlider.addEventListener("input", () => {
  updateSlidersUI();
  updateUI();
  saveToLocal();
});

fontSelector.addEventListener("input", () => {
  updateUI();
  saveToLocal();
});

accentSelector.addEventListener("input", () => {
  applyAccent(accentSelector.value);
  saveToLocal();
});

copyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    const state = {
      text: textInput.value,
      font: fontSelector.value,
      weight: fontWeightSlider.value,
      line: lineHeightSlider.value,
      color: accentSelector.value
    };

    Object.entries(state).forEach(([k, v]) => params.set(k, v));

    url.search = params.toString();

    navigator.clipboard.writeText(url.toString()).then(() => {
      alert("URLコピーしました");
    });
  });
});

clearButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    textInput.value = "";
    updateDisplay();
    saveToLocal();
  });
});

resetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    textInput.value = initialState.text;
    fontSelector.value = initialState.font;
    fontWeightSlider.value = initialState.weight;
    lineHeightSlider.value = initialState.line;
    accentSelector.value = initialState.color;

    applyAccent(initialState.color);

    updateDisplay();
    updateUI();
    updateSlidersUI();
    saveToLocal();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadFromLocal();

  updateDisplay();
  updateUI();
  updateSlidersUI();

  applyAccent(accentSelector.value);
  saveToLocal();
});