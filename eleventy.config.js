import { execFileSync } from "node:child_process";
import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";

function getGitAuthorDate(inputPath) {
	try {
		const isoDate = execFileSync(
			"git",
			["log", "-1", "--format=%aI", "--", inputPath],
			{ encoding: "utf8" }
		).trim();

		if (!isoDate) {
			return "";
		}

		return new Intl.DateTimeFormat("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(isoDate));
	} catch {
		return "";
	}
}


export default async function (eleventyConfig) {

	eleventyConfig.addTemplateFormats("txt");

	eleventyConfig.addExtension("txt", {
		outputFileExtension: "html",

		compile(inputContent) {
			return function () {
				return inputContent;
			};
		},
	});

	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addShortcode("gitAuthorDate", function (inputPath) {
		return getGitAuthorDate(inputPath);
	});

	eleventyConfig.addTemplate("index.njk", `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Home</title>
</head>

<body>
  <header>
    <h1>Home</h1>
  </header>

  <main>
    <h2>Posts</h2>

    <ul>
      {% for post in collections.posts %}
        <li>
          <a href="{{ post.url }}">{{ post.fileSlug }}</a>
        </li>
      {% endfor %}
    </ul>
  </main>
</body>
</html>`);

};

export const config = {
	templateFormats: ["md", "txt"],

	markdownTemplateEngine: "njk",

	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// pathPrefix: "/",
};