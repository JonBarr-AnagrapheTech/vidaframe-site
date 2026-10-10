import assert from "node:assert/strict";
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

console.log("check ok");
