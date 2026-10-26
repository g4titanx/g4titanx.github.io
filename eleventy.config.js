const markdownIt = require("markdown-it");
const texmath = require("markdown-it-texmath");
const katex = require("katex");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy({ "node_modules/katex/dist": "assets/katex" });

  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: {
      throwOnError: false,
    },
  });
  eleventyConfig.setLibrary("md", md);

  const getPosts = (collectionApi) =>
    collectionApi.getFilteredByGlob("_posts/**/*.md").slice().reverse();
  const folderFromPath = (inputPath) => {
    const path = inputPath.replace(/\\/g, "/");
    return path.match(/(?:^|\/)_posts\/([^/]+)\//)?.[1];
  };
  const postFolder = (post) => folderFromPath(post.inputPath);
  const isTechnical = (post) => postFolder(post) === "technical";
  const seriesFolder = (post) => post.data.seriesTitle && postFolder(post);

  const getEntries = (collectionApi, technical) => {
    const seenSeries = new Set();
    const entries = getPosts(collectionApi)
      .filter((post) => isTechnical(post) === technical)
      .flatMap((post) => {
        const folder = seriesFolder(post);
        if (!folder) {
          return [{ title: post.data.title, url: post.url, date: post.date }];
        }
        if (seenSeries.has(folder)) return [];
        seenSeries.add(folder);
        return [{
          title: post.data.seriesTitle,
          url: `/posts/${folder}/`,
          sortDate: post.date,
          isSeries: true,
        }];
      });
    return entries.sort((a, b) =>
      new Date(b.sortDate || b.date) - new Date(a.sortDate || a.date)
    );
  };

  eleventyConfig.addCollection("posts", getPosts);
  eleventyConfig.addCollection("technicalEntries", (collectionApi) =>
    getEntries(collectionApi, true)
  );
  eleventyConfig.addCollection("nonTechnicalEntries", (collectionApi) =>
    getEntries(collectionApi, false)
  );
  eleventyConfig.addCollection("postSeries", (collectionApi) => {
    const series = new Map();
    for (const post of getPosts(collectionApi)) {
      const folder = seriesFolder(post);
      if (!folder) continue;
      if (!series.has(folder)) {
        series.set(folder, {
          slug: folder,
          title: post.data.seriesTitle,
          posts: [],
        });
      }
      series.get(folder).posts.push(post);
    }
    for (const group of series.values()) {
      group.posts.sort((a, b) => {
        const aOrder = Number.isFinite(a.data.seriesOrder) ? a.data.seriesOrder : Infinity;
        const bOrder = Number.isFinite(b.data.seriesOrder) ? b.data.seriesOrder : Infinity;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.inputPath.localeCompare(b.inputPath, undefined, { numeric: true });
      });
    }
    return [...series.values()];
  });

  eleventyConfig.addFilter("date_to_rfc822", function (date) {
    return new Date(date).toUTCString();
  });

  eleventyConfig.addFilter("series_url", (inputPath) =>
    `/posts/${folderFromPath(inputPath)}/`
  );

  eleventyConfig.addFilter("xml_escape", function (str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  });

  eleventyConfig.setServerOptions({
    domDiff: true,
    hostname: "0.0.0.0",
  });

  return {
    dir: {
      layouts: "_layouts",
    },
    templateFormats: ["html", "md", "liquid"],
  };
};
