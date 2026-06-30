import { execFileSync } from "node:child_process";
import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";

function getGitAuthorDate(inputPath) {
	try {
		const relativePath = inputPath.replace(/^content\//, "");
		const isoDate = execFileSync(
			"git",
			["log", "-1", "--format=%aI", "--", relativePath],
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


	eleventyConfig.addTemplate("layouts/post.njk", `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{ title or page.fileSlug }}</title>
</head>

<body>
  <header>
    <h1>{{ title or page.fileSlug }}</h1>
    <p>
      Authored:
      {% gitAuthorDate page.inputPath %}
    </p>
  </header>

  <main>
    {{ content | safe }}
  </main>
</body>
</html>
`);


	eleventyConfig.addGlobalData("eleventyComputed", {
		layout: (data) => {
			if (data.page.inputPath?.includes("index.njk")) {
				return false;
			}
			return "layouts/post.njk";
		},

		tags: (data) => {
			if (data.page.inputPath?.includes("index.njk")) {
				return [];
			}
			return "posts";
		},
	});

};

export const config = {
	templateFormats: ["md", "txt"],

	markdownTemplateEngine: "njk",

	dir: {
		input: "content",
		includes: "../builder/_includes",
		data: "../builder/_data",
		output: "_site"
	},

	// pathPrefix: "/",
};