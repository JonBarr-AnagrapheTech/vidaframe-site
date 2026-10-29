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
    /Choose Favorites, your albums, or an iCloud Shared Album\. The house is one swipe away\. Coming to the App Store\./g,
  )?.length,
  3,
);
assert.match(indexHtml, /property="og:image" content="https:\/\/anagraphetech\.com\/og\.png"/);
assert.match(indexHtml, /name="twitter:image" content="https:\/\/anagraphetech\.com\/og\.png"/);
assert.match(indexHtml, /Your albums, full screen/);
assert.match(indexHtml, /The house, one swipe away/);
assert.match(indexHtml, /<p class="badge">Coming to the App Store<\/p>/);
assert.match(indexHtml, /VidaFrame is free/);
assert.match(indexHtml, /VidaFrame Plus is an optional upgrade at \$0\.49 a month/);
assert.match(indexHtml, /removes the notice and adds weather/);
assert.match(indexHtml, /We'll write when VidaFrame is on the App Store/);
assert.doesNotMatch(indexHtml, /Coming soon/);
assert.doesNotMatch(indexHtml, /photo frame for iCloud Photos/);
assert.doesNotMatch(indexHtml, /\bads\b/i);
assert.doesNotMatch(indexHtml, /apps\.apple\.com/);
const ogSource = readFileSync(new URL("../scripts/og.html", import.meta.url), "utf8");
assert.match(ogSource, /Your albums, full screen/);
assert.match(ogSource, /The house, one swipe away/);
assert.match(ogSource, />Coming to the App Store</);
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

console.log("check ok");
