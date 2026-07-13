const formatSlug = (slug = "") => {
  const formattedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\//g, "")
    .replace(/\s+/g, "-");
  return formattedSlug;
};

const BOT_UA_PATTERN =
  /bot|crawl|spider|facebookexternalhit|Twitterbot|Slackbot|Discordbot|LinkedInBot|TelegramBot|WhatsApp|SkypeUriPreview|Applebot|Pinterest|vkShare|redditbot/i;

const isBotUserAgent = (userAgent = "") => BOT_UA_PATTERN.test(userAgent);

export { formatSlug, isBotUserAgent };
