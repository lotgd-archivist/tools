const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('node:path');
const { exit } = require("process");

const mainUrl = process.argv[2];
if (!mainUrl) {
	exit();
}
var host = new URL(mainUrl).host;
if (!fs.existsSync("output/")) {
	fs.mkdirSync("output/");
}
const outputPath = "output/" + host;
if (!fs.existsSync(outputPath)) {
	fs.mkdirSync(outputPath);
} else {
	fs.rmdirSync(outputPath, { recursive: true})
}

async function getPage(url) {
	try {
		var response = await fetch(url);
		var buffer = await response.arrayBuffer();
		return new TextDecoder("latin1").decode(buffer);
	} catch (ex) {
		console.log("Failed to fetch '" + mainUrl + "'. ");
		console.log(ex);
		exit();
	}
}

async function saveSource(outputPath, sourceUrl) {
	console.log("Grabbing "+ sourceUrl);
	var body = await getPage(sourceUrl);
	body = body.replaceAll("<br />", ";;br;;");
	const jsdom = new JSDOM(body);

	var filename = jsdom.window.document.querySelector("h1").textContent.replace("View Source: ", "");
	if (!filename) {
		return;
	}
	var targetDir = outputPath + path.dirname(filename);
	fs.mkdirSync(targetDir, { recursive: true });
	const codeTag = jsdom.window.document.querySelector("code");
	var codeText = codeTag?.textContent;
	if (codeText) {
		codeText = codeText.replaceAll(";;br;;", "\n");
		fs.writeFileSync(outputPath + filename, codeText);
	}
}

getPage(mainUrl).then(body => {
	const { document } = (new JSDOM(
		body,
	)).window;
	const sourceUrls = [...document.querySelectorAll("li > a")].map(a => mainUrl + a.href.replace("source.php", ""));
	sourceUrls.forEach(sourceUrl => {
		saveSource(outputPath, sourceUrl);
	});
});