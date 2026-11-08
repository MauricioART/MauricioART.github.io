import { mkdir, readFile, writeFile } from "node:fs/promises";
import { locales } from "./locales.mjs";
import { analyticsMeasurementId } from "./site-config.mjs";

if (typeof analyticsMeasurementId !== "string" ||
    (analyticsMeasurementId !== "" && !/^G-[A-Z0-9]+$/.test(analyticsMeasurementId))) {
  throw new Error("analyticsMeasurementId must be empty or a GA4 ID starting with G-.");
}

const analyticsTag = analyticsMeasurementId ? `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${analyticsMeasurementId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", "${analyticsMeasurementId}");
  </script>` : "";

const template = await readFile(new URL("./portfolio.html", import.meta.url), "utf8");
const icons = await readFile(new URL("./icons.svg", import.meta.url), "utf8");
const github = "https://github.com/MauricioART/";
const projects = [
  { repo: "B-Tree-Algorithm", image: "b-plus-tree.svg", icon: "cube" },
  { repo: "External-Sorting-Algorithms", image: "sorting.svg", icon: "bars" },
  { repo: "Pizzaddiction", image: "pizza.svg", icon: "phone" }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function projectCards(details, assets) {
  return projects.map(({ repo, image, icon: glyph }, index) => {
    const [name, description, tags] = details[index].map(item =>
      Array.isArray(item) ? item.map(escapeHtml) : escapeHtml(item)
    );
    const projectClass = index === 0 ? "project project-featured" : "project project-compact";
    return `<article class="${projectClass}" data-reveal>
      <div class="project-media"><img class="project-image" src="${assets}${image}" alt="" width="600" height="175" decoding="async"></div>
      <div class="project-body">
        <p class="project-index">${icon(glyph)} <span>0${index + 1}</span></p>
        <h3><a href="${github}${repo}">${name}</a></h3>
        <p>${description}</p>
        <div class="project-meta">
          <ul class="tags">${tags.map(tag => `<li>${tag}</li>`).join("")}</ul>
          <span class="project-arrow" aria-hidden="true">${icon("arrow")}</span>
        </div>
      </div>
    </article>`;
  }).join("\n          ");
}

await mkdir(new URL("../es/", import.meta.url), { recursive: true });
for (const [lang, { projectDetails, ...copy }] of Object.entries(locales)) {
  const english = lang === "en";
  const assets = english ? "assets/" : "../assets/";
  const values = {
    ...Object.fromEntries(Object.entries(copy).map(([key, value]) => [key, escapeHtml(value)])),
    lang, assets, analyticsTag, icons: icons.trim(), crestWidth: 196, crestHeight: 220,
    englishHref: english ? "./index.html" : "../index.html",
    spanishHref: english ? "es/index.html" : "./index.html",
    englishCurrent: english ? 'aria-current="page"' : "",
    spanishCurrent: english ? "" : 'aria-current="page"',
    projectCards: projectCards(projectDetails, assets),
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Mauricio Arturo Aguilera Roa",
      jobTitle: copy.job,
      sameAs: [github.slice(0, -1), "https://www.linkedin.com/in/arturo-aguilera-roa-47a8821b5"],
      knowsAbout: ["Java", "Spring Boot", "PostgreSQL", "Data structures", "Algorithms"]
    }).replaceAll("<", "\\u003c")
  };
  const html = template.replace(/{{(\w+)}}/g, (_, key) => {
    if (key.endsWith("Icon")) return icon(key.slice(0, -4));
    if (!(key in values)) throw new Error(`Missing template value: ${key}`);
    return values[key];
  });
  await writeFile(new URL(english ? "../index.html" : "../es/index.html", import.meta.url), html);
}
