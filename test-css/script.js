const textInput = document.getElementById("textInput");
const displayArea = document.getElementById("displayArea");
const header = document.getElementById("appTitle");

const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeValue = document.getElementById("fontSizeValue");

const fontWeightSlider = document.getElementById("fontWeightSlider");
const fontWeightValue = document.getElementById("fontWeightValue");

const lineHeightSlider = document.getElementById("lineHeightSlider");
const lineHeightValue = document.getElementById("lineHeightValue");

const fontSelector = document.getElementById("fontSelector");
const accentSelector = document.getElementById("accentSelector");

const copyButtons = document.querySelectorAll("[data-action='copy']");
const clearButtons = document.querySelectorAll("[data-action='clear']");
const resetButtons = document.querySelectorAll("[data-action='reset']");
const actionButtons = document.querySelectorAll("[data-action]");

const initialState = {
  text: "",
  font: "'Noto Serif JP', serif",
  weight: "600",
  size: "120",
  line: "1.4",
  color: "#00793d"
};

const appParamOrder = ["text", "font", "weight", "size", "line", "color"];

function setAccentColor(color) {
  document.documentElement.style.setProperty("--color-primary", color);
}

function buildAppStateParams(params) {
  const current = {
    text: textInput.value,
    font: fontSelector.value,
    weight: fontWeightSlider.value,
    size: fontSizeSlider.value,
    line: lineHeightSlider.value,
    color: accentSelector.value
  };

  appParamOrder.forEach(key => {
    const currentValue = key === "color" ? current[key].toLowerCase() : current[key];
    const initialValue = key === "color" ? initialState[key].toLowerCase() : initialState[key];
    if (currentValue !== initialValue) params.set(key, current[key]);
  });
}

function getPreservedQueryParams() {
  const currentParams = new URLSearchParams(window.location.search);
  const preserved = new URLSearchParams();

  currentParams.forEach((value, key) => {
    if (appParamOrder.includes(key)) return;
    preserved.append(key, value);
  });

  return preserved;
}

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return luminance(r, g, b) > 0.5 ? "#000" : "#fff";
}

function getEdgeColorOnWhite(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const lightness = luminance(r, g, b);
  return lightness > 0.9 ? "#b8b8b8" : hex;
}

function updateStyles() {
  displayArea.style.fontSize = fontSizeSlider.value + "px";
  displayArea.style.fontWeight = fontWeightSlider.value;
  displayArea.style.lineHeight = lineHeightSlider.value;
  displayArea.style.fontFamily = fontSelector.value;

  const accent = accentSelector.value;

  setAccentColor(accent);

  const edgeColor = getEdgeColorOnWhite(accent);

  document.documentElement.style.setProperty("--color-secondary", edgeColor);

  header.style.color = getContrastColor(accent);

  actionButtons.forEach(button => {
    button.style.color = getContrastColor(accent);
  });
}

function updateDisplay() {
  displayArea.textContent = textInput.value || "test";
}

function updateURLParams() {
  const url = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();

  buildAppStateParams(params);

  const preserved = getPreservedQueryParams();
  preserved.forEach((value, key) => params.append(key, value));

  url.search = params.toString();
  window.history.replaceState({}, "", url.toString());
}

function saveToLocal() {
  const state = {
    text: textInput.value,
    font: fontSelector.value,
    weight: fontWeightSlider.value,
    size: fontSizeSlider.value,
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
  if (state.size) fontSizeSlider.value = state.size;
  if (state.line) lineHeightSlider.value = state.line;
  if (state.color) accentSelector.value = state.color;
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("text")) textInput.value = params.get("text");
  if (params.has("font")) fontSelector.value = params.get("font");
  if (params.has("weight")) fontWeightSlider.value = params.get("weight");
  if (params.has("size")) fontSizeSlider.value = params.get("size");
  if (params.has("line")) lineHeightSlider.value = params.get("line");
  if (params.has("color")) accentSelector.value = params.get("color");
}

textInput.addEventListener("input", () => {
  updateDisplay();
  saveToLocal();
  updateURLParams();
});

fontSizeSlider.addEventListener("input", () => {
  fontSizeValue.textContent = fontSizeSlider.value;
  updateStyles();
  saveToLocal();
  updateURLParams();
});

fontWeightSlider.addEventListener("input", () => {
  fontWeightValue.textContent = fontWeightSlider.value;
  updateStyles();
  saveToLocal();
  updateURLParams();
});

lineHeightSlider.addEventListener("input", () => {
  lineHeightValue.textContent = lineHeightSlider.value;
  updateStyles();
  saveToLocal();
  updateURLParams();
});

fontSelector.addEventListener("input", () => {
  updateStyles();
  saveToLocal();
  updateURLParams();
});

accentSelector.addEventListener("input", () => {
  updateStyles();
  saveToLocal();
  updateURLParams();
});

copyButtons.forEach(button => {
  button.addEventListener("click", () => {
    const url = new URL(window.location.origin + window.location.pathname);
    const params = new URLSearchParams();

    buildAppStateParams(params);

    const preserved = getPreservedQueryParams();
    preserved.forEach((value, key) => params.append(key, value));

    url.search = params.toString();

    navigator.clipboard.writeText(url.toString());
  });
});

clearButtons.forEach(button => {
  button.addEventListener("click", () => {
    textInput.value = "";
    updateDisplay();
    saveToLocal();
    updateURLParams();
  });
});

resetButtons.forEach(button => {
  button.addEventListener("click", () => {
    textInput.value = initialState.text;
    fontSelector.value = initialState.font;
    fontWeightSlider.value = initialState.weight;
    fontSizeSlider.value = initialState.size;
    lineHeightSlider.value = initialState.line;
    accentSelector.value = initialState.color;

    fontSizeValue.textContent = fontSizeSlider.value;
    fontWeightValue.textContent = fontWeightSlider.value;
    lineHeightValue.textContent = lineHeightSlider.value;

    setAccentColor(initialState.color);

    updateDisplay();
    updateStyles();
    saveToLocal();

    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", url);

    localStorage.removeItem("textAppState");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadFromLocal();
  loadFromURL();

  fontSizeValue.textContent = fontSizeSlider.value;
  fontWeightValue.textContent = fontWeightSlider.value;
  lineHeightValue.textContent = lineHeightSlider.value;

  updateDisplay();
  updateStyles();
  saveToLocal();
  updateURLParams();
});