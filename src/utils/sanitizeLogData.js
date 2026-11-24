const sensitiveKeyPattern =
  /password|passwd|otp|token|secret|authorization|api.?key|access.?code|working.?key/i;

const sanitizeMessage = (message, isAuthentication = false) => {
  if (!message) return "";

  let safeMessage = String(message)
    .replace(
      /\b(otp|one[- ]time(?:\s+password|\s+code)?|verification code)\b(?:\s+code)?\s*(?:is|:|=)\s*[A-Za-z0-9]{4,12}/gi,
      "$1 [REDACTED]",
    )
    .replace(
      /\b(otp|one[- ]time(?:\s+password|\s+code)?|verification code)\b\s*(?:is|:|=)?\s*\d{4,8}\b/gi,
      "$1 [REDACTED]",
    )
    .replace(
      /\b\d{4,8}(?=\s+(?:is\s+)?(?:your\s+)?(?:otp|one[- ]time(?:\s+password|\s+code)?|verification code)\b)/gi,
      "[REDACTED]",
    )
    .replace(/\b(password|passwd|pwd)\s*(?:is|:|=)?\s*[^\s,.;]+/gi, "$1 [REDACTED]")
    .replace(
      /\b(access token|refresh token|jwt)\s*(?:is|:|=)?\s*[^\s,.;]+/gi,
      "$1 [REDACTED]",
    );

  if (isAuthentication) {
    safeMessage = safeMessage.replace(/\b\d{4,}\b/g, "[REDACTED]");
  }

  return safeMessage.slice(0, 10000);
};

const sanitizeLogData = (value, depth = 0) => {
  if (depth > 6) return "[TRUNCATED]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeMessage(value).slice(0, 2000);
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => sanitizeLogData(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveKeyPattern.test(key)
        ? "[REDACTED]"
        : sanitizeLogData(item, depth + 1),
    ]),
  );
};

module.exports = { sanitizeLogData, sanitizeMessage };
