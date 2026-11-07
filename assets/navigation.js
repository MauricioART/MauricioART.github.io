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
