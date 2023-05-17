// Import the required modules
const fs = require("fs");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

// Read URLs from the file
const readUrls = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("urls.txt", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const urls = data.split("\n").filter((url) => url.trim() !== "");
        resolve(urls);
      }
    });
  });
};

// Fetch page title from the given URL
const fetchPageTitle = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const { document } = new JSDOM(html).window;
    const title = document.querySelector("title").textContent;
    return title;
  } catch (error) {
    console.error(`Failed to fetch title for ${url}`);
    return null;
  }
};

// Save URLs with titles to the output file
const saveUrlsWithTitles = (data) => {
  return new Promise((resolve, reject) => {
    const content = data.map(([url, title]) => `${url} - ${title}`).join("\n");
    fs.writeFile("urls_with_titles.txt", content, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Main function
(async () => {
  try {
    const urls = await readUrls();
    const urlsWithTitles = [];

    for (const url of urls) {
      const title = await fetchPageTitle(url);
      if (title) {
        urlsWithTitles.push([url, title]);
      }
    }

    await saveUrlsWithTitles(urlsWithTitles);
    console.log("URLs with titles saved successfully.");
  } catch (error) {
    console.error("Error:", error);
  }
})();
