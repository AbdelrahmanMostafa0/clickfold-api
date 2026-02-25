const formatSlug = (slug = "") => {
  const formattedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/\//g, "")
    .replace(/\s+/g, "-");
  return formattedSlug;
};

export { formatSlug };
