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

const copyButtons = document.querySelectorAll('[data-action="copy"]');
const clearButtons = document.querySelectorAll('[data-action="clear"]');
const resetButtons = document.querySelectorAll('[data-action="reset"]');

const initialState = {
  text: "",
  font: "'Noto Serif JP', serif",
  weight: "600",
  size: "120",
  line: "1.4",
  color: "#00793d"
};

const appParamOrder = ["text","font","weight","size","line","color"];

function buildAppStateParams(params){
  const current = {
    text: textInput.value,
    font: fontSelector.value,
    weight: fontWeightSlider.value,
    size: fontSizeSlider.value,
    line: lineHeightSlider.value,
    color: accentSelector.value
  };

  appParamOrder.forEach(key=>{
    if(current[key] !== initialState[key]){
      params.set(key, current[key]);
    }
  });
}

function applyAccent(color){
  document.documentElement.style.setProperty("--accent", color);
}

// contrast
function luminance(r,g,b){
  const a=[r,g,b].map(v=>{
    v/=255;
    return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);
  });
  return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}

function getContrastColor(hex){
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return luminance(r,g,b)>0.5?"#000":"#fff";
}

function updateStyles(){
  displayArea.style.fontSize = fontSizeSlider.value + "px";
  displayArea.style.fontWeight = fontWeightSlider.value;
  displayArea.style.lineHeight = fontHeightFix(lineHeightSlider.value);
  displayArea.style.fontFamily = fontSelector.value;

  applyAccent(accentSelector.value);

  const c = getContrastColor(accentSelector.value);
  document.documentElement.style.setProperty("--accent-text", c);
}

function fontHeightFix(v){
  return Math.max(1, Math.min(2, Number(v)));
}

function updateDisplay(){
  displayArea.textContent = textInput.value || "test";
}

function saveToLocal(){
  localStorage.setItem("textAppState", JSON.stringify({
    text:textInput.value,
    font:fontSelector.value,
    weight:fontWeightSlider.value,
    size:fontSizeSlider.value,
    line:lineHeightSlider.value,
    color:accentSelector.value
  }));
}

function loadFromLocal(){
  const s = JSON.parse(localStorage.getItem("textAppState")||"{}");
  if(s.text) textInput.value = s.text;
  if(s.font) fontSelector.value = s.font;
  if(s.weight) fontWeightSlider.value = s.weight;
  if(s.size) fontSizeSlider.value = s.size;
  if(s.line) lineHeightSlider.value = s.line;
  if(s.color) accentSelector.value = s.color;
}

textInput.addEventListener("input", ()=>{
  updateDisplay();
  saveToLocal();
});

fontSizeSlider.addEventListener("input", ()=>{
  fontSizeValue.textContent = fontSizeSlider.value;
  updateStyles();
  saveToLocal();
});

fontWeightSlider.addEventListener("input", ()=>{
  fontWeightValue.textContent = fontWeightSlider.value;
  updateStyles();
  saveToLocal();
});

lineHeightSlider.addEventListener("input", ()=>{
  lineHeightValue.textContent = lineHeightSlider.value;
  updateStyles();
  saveToLocal();
});

fontSelector.addEventListener("input", ()=>{
  updateStyles();
  saveToLocal();
});

accentSelector.addEventListener("input", ()=>{
  updateStyles();
  saveToLocal();
});

copyButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const url = new URL(location.href);
    const params = new URLSearchParams();
    buildAppStateParams(params);
    url.search = params.toString();
    navigator.clipboard.writeText(url.toString());
  });
});

clearButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    textInput.value = "";
    updateDisplay();
    saveToLocal();
  });
});

resetButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    textInput.value = initialState.text;
    fontSelector.value = initialState.font;
    fontWeightSlider.value = initialState.weight;
    fontSizeSlider.value = initialState.size;
    lineHeightSlider.value = initialState.line;
    accentSelector.value = initialState.color;

    updateDisplay();
    updateStyles();
    saveToLocal();
  });
});

document.addEventListener("DOMContentLoaded", ()=>{
  loadFromLocal();

  fontSizeValue.textContent = fontSizeSlider.value;
  fontWeightValue.textContent = fontWeightSlider.value;
  lineHeightValue.textContent = lineHeightSlider.value;

  updateDisplay();
  updateStyles();
  saveToLocal();
});