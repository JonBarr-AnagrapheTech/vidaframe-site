import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BUTTONDOWN_USERNAME } from "../site.config.js";
import { isValidEmail } from "../src/email.js";
import { cleanMessage, interpretSubscribeResponse } from "../src/subscribe.js";

assert.match(BUTTONDOWN_USERNAME, /^[A-Za-z0-9_-]+$/);

assert.equal(isValidEmail("ada@anagraphe.example"), true);
assert.equal(isValidEmail("  ada+frame@anagraphe.example  "), true);
assert.equal(isValidEmail(""), false);
assert.equal(isValidEmail("   "), false);
assert.equal(isValidEmail("ada"), false);
assert.equal(isValidEmail("ada@"), false);
assert.equal(isValidEmail("ada@example"), false);
assert.equal(isValidEmail("ada @example.com"), false);
assert.equal(isValidEmail("a@b.c"), true);
assert.equal(isValidEmail(`${"a".repeat(250)}@b.co`), false);

assert.equal(cleanMessage("  Already <b>there</b>  "), "Already there");
assert.equal(cleanMessage("<script>alert(1)</script>"), "alert(1)");
assert.equal(cleanMessage("a".repeat(181)), "");
assert.equal(cleanMessage("has < open"), "");

function response(status, body, type = "text/html") {
  return new Response(body, {
    status,
    headers: { "content-type": type },
  });
}

assert.deepEqual(
  await interpretSubscribeResponse(response(200, "<p>Check your inbox to confirm.</p>")),
  { outcome: "success" },
);
assert.deepEqual(
  await interpretSubscribeResponse(
    response(201, JSON.stringify({ email: "ada@anagraphe.example" }), "application/json"),
  ),
  { outcome: "success" },
);
assert.deepEqual(
  await interpretSubscribeResponse(response(200, "<div class='cf-turnstile'></div>")),
  { outcome: "follow" },
);
assert.deepEqual(
  await interpretSubscribeResponse(
    response(400, JSON.stringify({ detail: "Enter a valid email address." }), "application/json"),
  ),
  { outcome: "error", message: "Enter a valid email address." },
);
assert.deepEqual(
  await interpretSubscribeResponse(response(400, "<p>Bad request</p>")),
  { outcome: "error", message: "" },
);
assert.deepEqual(await interpretSubscribeResponse(response(403, "blocked")), {
  outcome: "follow",
});
assert.deepEqual(await interpretSubscribeResponse(response(429, "slow down")), {
  outcome: "follow",
});

function text(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const privacySource = readFileSync(new URL("../privacy/index.html", import.meta.url), "utf8");
const supportSource = readFileSync(new URL("../support/index.html", import.meta.url), "utf8");
const privacyHtml = text(privacySource);
const supportHtml = text(supportSource);
const viteConfig = readFileSync(new URL("../vite.config.js", import.meta.url), "utf8");

assert.match(indexHtml, /href="privacy\/"/);
assert.match(indexHtml, /href="support\/"/);
assert.match(indexHtml, /<title>VidaFrame — Your albums, full screen<\/title>/);
assert.match(indexHtml, /property="og:title" content="VidaFrame — Your albums, full screen"/);
assert.match(indexHtml, /name="twitter:title" content="VidaFrame — Your albums, full screen"/);
assert.equal(
  indexHtml.match(
    /Choose Favorites, your albums, or an iCloud Shared Album\. The house is one swipe away\. Available on the App Store\./g,
  )?.length,
  3,
);
assert.match(indexHtml, /property="og:image" content="https:\/\/anagraphetech\.com\/og\.png"/);
assert.match(indexHtml, /name="twitter:image" content="https:\/\/anagraphetech\.com\/og\.png"/);
assert.match(indexHtml, /Your albums, full screen/);
assert.match(indexHtml, /The house, one swipe away/);
assert.match(
  indexHtml,
  /<a class="store-badge" href="https:\/\/apps\.apple\.com\/us\/app\/id6822881564">/,
);
assert.match(indexHtml, /src="\/badges\/download-on-the-app-store\.svg"/);
assert.match(indexHtml, /alt="Download on the App Store"/);
assert.equal(indexHtml.match(/apps\.apple\.com/g)?.length, 2);
assert.equal(
  indexHtml.match(
    /<a class="store-badge" href="https:\/\/apps\.apple\.com\/us\/app\/id6822881564">/g,
  )?.length,
  2,
);
assert.doesNotMatch(indexHtml, /Coming to the App Store/);
assert.doesNotMatch(indexHtml, /<p class="badge">/);
const badgeSvg = readFileSync(
  new URL("../public/badges/download-on-the-app-store.svg", import.meta.url),
  "utf8",
);
assert.match(badgeSvg, /<title>Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917<\/title>/);
assert.doesNotMatch(badgeSvg, /<script/i);
assert.match(indexHtml, /VidaFrame is free/);
assert.match(indexHtml, /VidaFrame Plus is an optional upgrade at \$0\.49 a month/);
assert.match(indexHtml, /removes the notice and adds weather/);
assert.match(indexHtml, /id="signup-title">On the App Store</);
assert.match(indexHtml, /VidaFrame is available now\. We'll email you about the app\./);
assert.equal(indexHtml.match(/<button type="submit">Get updates<\/button>/g)?.length, 2);
assert.doesNotMatch(indexHtml, /Join the waitlist/);
assert.doesNotMatch(indexHtml, /We'll write when VidaFrame is on the App Store/);
assert.doesNotMatch(indexHtml, /Be first to know/);
assert.doesNotMatch(indexHtml, /when it's on the App Store/i);
assert.doesNotMatch(indexHtml, /coming to the App Store/i);
assert.doesNotMatch(indexHtml, /Coming soon/);
assert.doesNotMatch(indexHtml, /photo frame for iCloud Photos/);
assert.doesNotMatch(indexHtml, /\bads\b/i);
const ogSource = readFileSync(new URL("../scripts/og.html", import.meta.url), "utf8");
assert.match(ogSource, /Your albums, full screen/);
assert.match(ogSource, /The house, one swipe away/);
assert.match(ogSource, />Available on the App Store</);
assert.doesNotMatch(ogSource, /Coming to the App Store/);
assert.doesNotMatch(ogSource, /Coming soon/);
assert.doesNotMatch(ogSource, /Your photos, full screen/);
assert.match(privacySource, /href="\.\.\/privacy\/"/);
assert.match(privacySource, /href="\.\.\/support\/"/);
assert.match(supportSource, /href="\.\.\/privacy\/"/);
assert.match(supportSource, /href="\.\.\/support\/"/);
assert.match(privacyHtml, /Photos, Apple Home, and location are processed only on the device/);
assert.match(privacyHtml, /Weather requests send an approximate location to Apple WeatherKit/);
assert.match(privacyHtml, /Purchases go through Apple/);
assert.match(privacyHtml, /no accounts/i);
assert.match(privacyHtml, /analytics or tracking/);
assert.match(privacyHtml, /No data is sold/);
assert.match(privacyHtml, /privacy@anagraphetech\.com/);
assert.match(privacyHtml, /Anagraphe Tech LLC/);
assert.doesNotMatch(privacyHtml, /211 E Main St|Lisbon, IA|52253/);
assert.match(privacyHtml, /October 14, 2026/);
assert.match(supportHtml, /Choosing albums/);
assert.match(supportHtml, /Shared albums/);
assert.match(supportHtml, /Home controls/);
assert.match(supportHtml, /VidaFrame Plus is \$0\.49 a month/);
assert.match(supportHtml, /removes the notice and adds weather/);
assert.doesNotMatch(supportHtml, /\bads\b/i);
assert.doesNotMatch(privacyHtml, /\bads\b/i);
assert.match(supportHtml, /Restoring purchases/);
assert.match(supportHtml, /Canceling a subscription/);
assert.match(supportHtml, /support@anagraphetech\.com/);
assert.match(viteConfig, /privacy\/index\.html/);
assert.match(viteConfig, /support\/index\.html/);
assert.match(viteConfig, /es\/index\.html/);
assert.match(viteConfig, /es\/privacy\/index\.html/);
assert.match(viteConfig, /es\/support\/index\.html/);

function hreflang(html, lang, href) {
  assert.match(html, new RegExp(`<link rel="alternate" hreflang="${lang}" href="${href}" />`));
}

hreflang(indexHtml, "en", "https://anagraphetech.com/");
hreflang(indexHtml, "es", "https://anagraphetech.com/es/");
hreflang(indexHtml, "x-default", "https://anagraphetech.com/");
hreflang(privacySource, "en", "https://anagraphetech.com/privacy/");
hreflang(privacySource, "es", "https://anagraphetech.com/es/privacy/");
hreflang(privacySource, "x-default", "https://anagraphetech.com/privacy/");
hreflang(supportSource, "en", "https://anagraphetech.com/support/");
hreflang(supportSource, "es", "https://anagraphetech.com/es/support/");
hreflang(supportSource, "x-default", "https://anagraphetech.com/support/");
assert.match(indexHtml, /<html lang="en">/);
assert.match(indexHtml, /aria-label="Language"/);
assert.match(indexHtml, /href="\/es\/" hreflang="es" lang="es">Español</);
assert.match(indexHtml, /Made in the Midwest/);
assert.doesNotMatch(indexHtml, /Hecho en el Medio Oeste/);
assert.match(indexHtml, /this iPhone or iPad/);
assert.match(indexHtml, /On iPhone the frame[\s\S]*stays portrait/);
assert.match(indexHtml, /square photos count as portrait/);
assert.match(indexHtml, /Include landscape\s+photos/);
assert.match(indexHtml, /blurred fill/);
assert.match(indexHtml, /Set an iPhone or iPad where people actually gather/);
assert.doesNotMatch(indexHtml, /this iPad/);
assert.doesNotMatch(indexHtml, /an iPad app/);
assert.match(privacyHtml, /an app for iPhone and iPad/);
assert.match(privacyHtml, /this iPhone or iPad/);
assert.doesNotMatch(privacyHtml, /iPad app/);
assert.match(supportHtml, /Portrait on iPhone/);
assert.match(supportHtml, /Include landscape photos/);
assert.match(supportHtml, /On iPad, portrait and landscape photos both play/);
assert.doesNotMatch(supportHtml, /this iPad/);
assert.doesNotMatch(supportHtml, /On the iPad/);
assert.doesNotMatch(indexHtml, /navigator\.language/);
assert.match(privacySource, /href="\/es\/privacy\/"/);
assert.match(supportSource, /href="\/es\/support\/"/);

const esIndex = readFileSync(new URL("../es/index.html", import.meta.url), "utf8");
const esPrivacy = readFileSync(new URL("../es/privacy/index.html", import.meta.url), "utf8");
const esSupport = readFileSync(new URL("../es/support/index.html", import.meta.url), "utf8");
const esPrivacyText = text(esPrivacy);
const esSupportText = text(esSupport);

assert.match(esIndex, /<html lang="es">/);
assert.match(esPrivacy, /<html lang="es">/);
assert.match(esSupport, /<html lang="es">/);
hreflang(esIndex, "en", "https://anagraphetech.com/");
hreflang(esIndex, "es", "https://anagraphetech.com/es/");
hreflang(esIndex, "x-default", "https://anagraphetech.com/");
hreflang(esPrivacy, "en", "https://anagraphetech.com/privacy/");
hreflang(esPrivacy, "es", "https://anagraphetech.com/es/privacy/");
hreflang(esPrivacy, "x-default", "https://anagraphetech.com/privacy/");
hreflang(esSupport, "en", "https://anagraphetech.com/support/");
hreflang(esSupport, "es", "https://anagraphetech.com/es/support/");
hreflang(esSupport, "x-default", "https://anagraphetech.com/support/");
assert.match(esIndex, /<title>VidaFrame — Tus álbumes, en pantalla completa<\/title>/);
assert.match(esIndex, /property="og:title" content="VidaFrame — Tus álbumes, en pantalla completa"/);
assert.match(esIndex, /name="twitter:title" content="VidaFrame — Tus álbumes, en pantalla completa"/);
assert.match(esIndex, /property="og:locale" content="es_LA"/);
assert.match(esIndex, /property="og:image" content="https:\/\/anagraphetech\.com\/og-es\.png"/);
assert.match(esIndex, /name="twitter:image" content="https:\/\/anagraphetech\.com\/og-es\.png"/);
assert.match(esIndex, /property="og:url" content="https:\/\/anagraphetech\.com\/es\/"/);
assert.match(esIndex, /href="privacy\/"/);
assert.match(esIndex, /href="support\/"/);
assert.match(esIndex, /Hecho en el Medio Oeste/);
assert.doesNotMatch(esIndex, /Made in the Midwest/);
assert.match(esIndex, /este iPhone o iPad/);
assert.match(esIndex, /el marco[\s\S]*se queda en vertical/);
assert.match(esIndex, /las fotos cuadradas cuentan como verticales/);
assert.match(esIndex, /Incluir\s+fotos\s+horizontales/);
assert.match(esIndex, /relleno\s+difuminado/);
assert.match(esIndex, /Pon un iPhone o un iPad/);
assert.doesNotMatch(esIndex, /este iPad/);
assert.doesNotMatch(esIndex, /para iPad/);
assert.match(esPrivacyText, /una app para iPhone y iPad/);
assert.match(esPrivacyText, /este iPhone o iPad/);
assert.doesNotMatch(esPrivacyText, /app para iPad/);
assert.match(esSupportText, /Vertical en el iPhone/);
assert.match(esSupportText, /Incluir fotos horizontales/);
assert.match(esSupportText, /En el iPad se ven las fotos verticales y las horizontales/);
assert.doesNotMatch(esSupportText, /este iPad/);
assert.doesNotMatch(esSupportText, /En el iPad, inicia/);
assert.doesNotMatch(esSupportText, /En el iPad, abre/);
assert.match(esIndex, /Tus álbumes, en pantalla completa/);
assert.match(esIndex, /La casa, a un deslizamiento/);
assert.match(esIndex, /VidaFrame es gratis/);
assert.match(esIndex, /VidaFrame Plus es una mejora opcional a \$0\.49 al mes/);
assert.match(esIndex, /Quita el aviso y agrega el clima/);
assert.match(
  esIndex,
  /<a class="store-badge" href="https:\/\/apps\.apple\.com\/us\/app\/id6822881564">/,
);
assert.equal(
  esIndex.match(
    /<a class="store-badge" href="https:\/\/apps\.apple\.com\/us\/app\/id6822881564">/g,
  )?.length,
  2,
);
assert.match(esIndex, /src="\/badges\/descargalo-en-el-app-store\.svg"/);
assert.match(esIndex, /alt="Descárgalo en el App Store"/);
assert.doesNotMatch(esIndex, /download-on-the-app-store\.svg/);
assert.doesNotMatch(esIndex, /Coming soon/i);
assert.doesNotMatch(esIndex, /navigator\.language/);
assert.match(esIndex, /aria-label="Idioma"/);
assert.match(esPrivacy, /href="\.\.\/privacy\/"/);
assert.match(esPrivacy, /href="\.\.\/support\/"/);
assert.match(esSupport, /href="\.\.\/privacy\/"/);
assert.match(esSupport, /href="\.\.\/support\/"/);
assert.match(esPrivacy, /La[\s\S]*versión en inglés[\s\S]*es la que rige/);
assert.match(esPrivacy, /href="\/privacy\/"/);
assert.match(esPrivacyText, /Las fotos, Apple Home y la ubicación se procesan solo en el dispositivo/);
assert.match(esPrivacyText, /una ubicación aproximada a Apple WeatherKit/);
assert.match(esPrivacyText, /Las compras pasan por Apple/);
assert.match(esPrivacyText, /No hay cuentas/);
assert.match(esPrivacyText, /analítica ni seguimiento/);
assert.match(esPrivacyText, /No se venden datos/);
assert.match(esPrivacyText, /privacy@anagraphetech\.com/);
assert.match(esPrivacyText, /14 de octubre de 2026/);
assert.match(esPrivacyText, /Anagraphe Tech LLC/);
assert.match(esSupportText, /Elegir álbumes/);
assert.match(esSupportText, /Álbumes compartidos/);
assert.match(esSupportText, /Controles de la casa/);
assert.match(esSupportText, /VidaFrame Plus cuesta \$0\.49 al mes/);
assert.match(esSupportText, /Quita el aviso y agrega el clima/);
assert.match(esSupportText, /Restaurar compras/);
assert.match(esSupportText, /Cancelar una suscripción/);
assert.match(esSupportText, /support@anagraphetech\.com/);
assert.doesNotMatch(esPrivacyText, /\bads\b/i);
assert.doesNotMatch(esSupportText, /\bads\b/i);
assert.doesNotMatch(esIndex, /\bads\b/i);

const esBadge = readFileSync(
  new URL("../public/badges/descargalo-en-el-app-store.svg", import.meta.url),
  "utf8",
);
assert.match(esBadge, /<title>Download_on_the_App_Store_Badge_ESMX_RGB_wht_100217<\/title>/);
assert.doesNotMatch(esBadge, /<script/i);

const ogEsPng = readFileSync(new URL("../public/og-es.png", import.meta.url));
assert.equal(ogEsPng[0], 0x89);
assert.equal(ogEsPng.readUInt32BE(16), 1200);
assert.equal(ogEsPng.readUInt32BE(20), 630);

const ogEs = readFileSync(new URL("../scripts/og-es.html", import.meta.url), "utf8");
assert.match(ogEs, /Tus álbumes, en pantalla completa/);
assert.match(ogEs, /La casa, a un deslizamiento/);
assert.match(ogEs, />Disponible en el App Store</);
assert.doesNotMatch(ogEs, /Coming soon/);

const clockSource = readFileSync(new URL("../src/clock.js", import.meta.url), "utf8");
const waitlistSource = readFileSync(new URL("../src/waitlist.js", import.meta.url), "utf8");
assert.match(clockSource, /en-US/);
assert.match(clockSource, /es-419/);
assert.match(waitlistSource, /You're on the list/);
assert.match(waitlistSource, /Ya estás en la lista/);
assert.doesNotMatch(clockSource, /navigator\.language/);
assert.doesNotMatch(waitlistSource, /navigator\.language/);

console.log("check ok");
