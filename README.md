# Mauricio Arturo Aguilera Roa · Portfolio

Open `index.html` in a browser for English, or `es/index.html` for Spanish. Both pages can be hosted on any static server without a runtime or external services.

- `src/portfolio.html` and `src/locales.mjs` define the shared page and translations.
- `src/icons.svg` contains the inline icon symbols.
- `assets/` contains shared styles, navigation, theme controls, and illustrations.
- `index.html` and `es/index.html` are generated static pages and can be served directly.

After changing the template or copy, run `node src/build-pages.mjs` and include the generated pages in the change. The theme follows the system until a visitor selects a preference. The language is part of the URL.

Set the canonical URLs and absolute alternate-language metadata once the production domain is known.

Google Analytics 4 can be enabled by setting `analyticsMeasurementId` in
`src/site-config.mjs` to the web stream's `G-...` ID and running
`node src/build-pages.mjs`. The Google tag loads asynchronously on both
language pages. An empty ID disables the integration at build time.
Analytics setup is pending creation of the property and web data stream.
After deployment, verify collection using Google Tag Assistant and the
Realtime report in that property.
