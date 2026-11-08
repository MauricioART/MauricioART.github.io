const root = document.documentElement;
const menuLinks = [...document.querySelectorAll(".navigation a")];
const languageLinks = [...document.querySelectorAll(".language a")];
const themes = [...document.querySelectorAll("[data-theme-option]")];
const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const themeKey = "portfolio-theme";

function syncNavigation() {
  const selected = menuLinks.find(link => link.hash === location.hash) || menuLinks[0];

  for (const link of menuLinks) {
    if (link === selected) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }

  for (const link of languageLinks) {
    link.hash = location.hash;
  }
}

function syncTheme() {
  const current = root.dataset.theme || (prefersDark.matches ? "dark" : "light");
  for (const button of themes) {
    button.setAttribute("aria-pressed", String(button.dataset.themeOption === current));
  }
}

for (const button of themes) {
  button.addEventListener("click", () => {
    const theme = button.dataset.themeOption;
    root.dataset.theme = theme;
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      // Keep the theme active for the current page if storage is unavailable.
    }
    syncTheme();
  });
}

document.querySelector(".theme").hidden = false;
window.addEventListener("hashchange", syncNavigation);
prefersDark.addEventListener("change", syncTheme);
syncNavigation();
syncTheme();

if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  for (const item of document.querySelectorAll("[data-reveal]")) reveal.observe(item);
}

const hero = document.querySelector(".hero");
const canvas = document.querySelector(".matrix-rain");
const motionButton = document.querySelector(".motion-control");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const context = canvas.getContext("2d");
let animationFrame = 0;
let lastFrame = 0;
let drops = [];
let visible = true;
let paused = false;
let width = 0;
let height = 0;
const characters = "01アイウエオカキクケコサシスセソ{}[]<>";

function resizeRain() {
  const bounds = hero.getBoundingClientRect();
  width = Math.round(bounds.width);
  height = Math.round(bounds.height);
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  drops = Array.from({ length: Math.ceil(width / 24) }, () => -Math.random() * height / 22);
}

function drawRain(now) {
  if (now - lastFrame >= 65) {
    lastFrame = now;
    context.clearRect(0, 0, width, height);
    context.font = "14px monospace";
    context.fillStyle = "#39bd6b";
    for (let column = 0; column < drops.length; column++) {
      for (let tail = 0; tail < 9; tail++) {
        context.globalAlpha = (1 - tail / 9) * .8;
        const glyph = characters[(column * 7 + tail + Math.floor(drops[column])) % characters.length];
        if (glyph) context.fillText(glyph, column * 24, (drops[column] - tail) * 22);
      }
      drops[column] += .32;
      if (drops[column] * 22 > height + 220) drops[column] = -Math.random() * 18;
    }
    context.globalAlpha = 1;
  }
  animationFrame = requestAnimationFrame(drawRain);
}

function syncRain() {
  cancelAnimationFrame(animationFrame);
  motionButton.hidden = reducedMotion.matches || !context;
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.textContent = document.documentElement.lang === "es"
    ? (paused ? "▶ Activar Matrix" : "Ⅱ Pausar Matrix")
    : (paused ? "▶ Enable Matrix" : "Ⅱ Pause Matrix");
  if (reducedMotion.matches) context?.clearRect(0, 0, width, height);
  if (context && !paused && !reducedMotion.matches && visible && !document.hidden) {
    animationFrame = requestAnimationFrame(drawRain);
  }
}

if (context) {
  new ResizeObserver(resizeRain).observe(hero);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncRain();
  }).observe(hero);
  motionButton.addEventListener("click", () => {
    paused = !paused;
    syncRain();
  });
  reducedMotion.addEventListener("change", syncRain);
  document.addEventListener("visibilitychange", syncRain);
  resizeRain();
  syncRain();
}
