import ogs from "open-graph-scraper";

const scrapeOG = async (url) => {
  try {
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          "user-agent": "ChatLinkPreviewBot/1.0",
        },
      },
    });
    return {
      title: result.ogTitle || null,
      description: result.ogDescription || null,
      image: result.ogImage[0]?.url || null,
      siteName: result.ogSiteName || null,
      url: result.ogUrl || url,
    };
  } catch (error) {
    return { title: null, description: null, image: null };
  }
};
export default scrapeOG;
