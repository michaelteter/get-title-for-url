// Import required modules
import axios from "axios";
import cheerio from "cheerio";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname } from "path";

// To use __dirname in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to get the title from the URL
const getTitle = async (url) => {
  try {
    const response = await axios.get(url);
    const finalUrl = response.request.res.responseUrl;
    const $ = cheerio.load(response.data);
    const title = $("head title").text();
    return { title, finalUrl };
  } catch (error) {
    console.error(`Error fetching the URL: ${error.message}`);
    return { title: "", finalUrl: "" };
  }
};

// Function to read and filter rows from the km_links table
const readFilteredLinks = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("/Users/mteter/.links.db", (err) => {
      if (err) {
        console.error(`Error opening the database: ${err.message}`);
        reject(err);
      }
    });

    const query = `
      SELECT *
      FROM km_links
      WHERE title is null or LENGTH(title) = 0;
    `;

    db.all(query, (err, rows) => {
      if (err) {
        console.error(`Error fetching rows from km_links: ${err.message}`);
        reject(err);
      } else {
        // console.log("Filtered km_links rows:");
        // console.table(rows);
        resolve(rows);
      }
    });

    db.close((err) => {
      if (err) {
        console.error(`Error closing the database: ${err.message}`);
        reject(err);
      }
    });
  });
};

// Function to update the km_links table
const updateLinks = async (url, title, finalUrl) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("/Users/mteter/.links.db", (err) => {
      if (err) {
        console.error(`Error opening the database: ${err.message}`);
        reject(err);
      }
    });

    const query = `
      UPDATE km_links
      SET title = ?, final_url = ?
      WHERE url = ?;
    `;

    db.run(query, [title, finalUrl, url], function (err) {
      if (err) {
        console.error(`Error updating km_links: ${err.message}`);
        reject(err);
      } else {
        console.log(
          `Updated km_links (URL: ${url}, Title: ${title}, Final URL: ${finalUrl})`
        );
        resolve(this.changes);
      }
    });

    db.close((err) => {
      if (err) {
        console.error(`Error closing the database: ${err.message}`);
        reject(err);
      }
    });
  });
};

// Function to update the km_links table
const updateLinks = async (url, title, finalUrl) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("/Users/mteter/.links.db", (err) => {
      if (err) {
        console.error(`Error opening the database: ${err.message}`);
        reject(err);
      }
    });

    const query = `
      UPDATE km_links
      SET title = ?, final_url = ?
      WHERE url = ?;
    `;

    db.run(query, [title, finalUrl, url], function (err) {
      if (err) {
        console.error(`Error updating km_links: ${err.message}`);
        reject(err);
      } else {
        console.log(
          `Updated km_links (URL: ${url}, Title: ${title}, Final URL: ${finalUrl})`
        );
        resolve(this.changes);
      }
    });

    db.close((err) => {
      if (err) {
        console.error(`Error closing the database: ${err.message}`);
        reject(err);
      }
    });
  });
};

const main = async () => {
  // Call the readFilteredLinks function and store the result in a variable
  const filteredRows = await readFilteredLinks();

  // Use a for...of loop instead of forEach to work with async/await
  for (const row of filteredRows) {
    const { title, finalUrl } = await getTitle(row.url);

    // Call the updateLinks function to update the SQLite table
    // don't really do it.
    // await updateLinks(row.url, title, finalUrl);

    console.log(`URL: ${finalUrl} => Title: ${title}`);
  }
};

// Call the main function
main();
