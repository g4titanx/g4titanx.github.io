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

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/*.md").reverse();
  });

  eleventyConfig.addFilter("date_to_rfc822", function (date) {
    return new Date(date).toUTCString();
  });

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
