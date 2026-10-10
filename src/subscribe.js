const CHALLENGE = /captcha|turnstile|cf-challenge|verify you are human|hcaptcha|recaptcha/i;

export function cleanMessage(value) {
  if (typeof value !== "string") return "";
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text || text.length > 180 || /[<>]/.test(text)) return "";
  return text;
}

function messageFromPayload(data) {
  if (!data || typeof data !== "object") return "";
  if (typeof data.detail === "string") return cleanMessage(data.detail);
  if (Array.isArray(data.detail)) {
    const first = data.detail[0];
    if (typeof first === "string") return cleanMessage(first);
    if (first && typeof first.msg === "string") return cleanMessage(first.msg);
  }
  if (typeof data.error === "string") return cleanMessage(data.error);
  if (typeof data.message === "string") return cleanMessage(data.message);
  if (typeof data.email === "string") return cleanMessage(data.email);
  if (Array.isArray(data.email) && typeof data.email[0] === "string") {
    return cleanMessage(data.email[0]);
  }
  return "";
}

export async function interpretSubscribeResponse(response) {
  let body = "";
  try {
    body = await response.text();
  } catch {
    body = "";
  }

  if (CHALLENGE.test(body)) return { outcome: "follow" };

  const type = response.headers.get("content-type") || "";
  const trimmed = body.trim();
  if (type.includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      if (response.ok) return { outcome: "success" };
      return { outcome: "error", message: messageFromPayload(data) };
    } catch {
      // Fall through and treat the body as HTML.
    }
  }

  if (response.ok) return { outcome: "success" };
  if (response.status === 403 || response.status === 429 || response.status === 503) {
    return { outcome: "follow" };
  }
  return { outcome: "error", message: "" };
}
