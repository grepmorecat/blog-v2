import { execFileSync } from "node:child_process";
import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";

function getGitAuthorDate(inputPath) {
	try {
		if (!inputPath) {
			return "";
		}

		if (!inputPath.startsWith("../content/") && !inputPath.startsWith("content/")) {
			return "";
		}

		const relativePath = inputPath
			.replace(/^\.\.\/content\//, "")
			.replace(/^content\//, "");

		const isoDate = execFileSync(
			"git",
			["log", "--follow", "--diff-filter=A", "--format=%aI", "--", relativePath],
			{
				encoding: "utf8",
				cwd: "../content",
			}
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
	eleventyConfig.ignores.add("../content/private/**");

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

	eleventyConfig.addTemplate("index.njk", `
<!doctype html>
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

	eleventyConfig.addGlobalData("eleventyComputed", {
		layout: (data) => {
			if (data.page.inputPath?.includes("index.njk")) {
				return false;
			}
			return "layouts/post.njk";
		},
	});

	eleventyConfig.addCollection("posts", function (collectionApi) {
		return collectionApi.getFilteredByGlob("../content/*.{md,txt}");
	});

};

export const config = {
	templateFormats: ["md", "txt", "njk"],

	markdownTemplateEngine: "njk",

	dir: {
		input: "../content",
		includes: "../builder/_includes",
		data: "../builder/_data",
		output: "./_site"
	},

	// pathPrefix: "/",
};