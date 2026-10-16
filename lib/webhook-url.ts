// SSRF guard: only official Discord webhook endpoints are accepted.
export function isValidDiscordWebhook(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && ["discord.com", "discordapp.com"].includes(u.hostname) && /^\/api\/webhooks\/\d+\/[\w-]+$/.test(u.pathname);
  } catch { return false; }
}
