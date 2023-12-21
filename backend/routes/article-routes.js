// Required modules
const cheerio = require('cheerio'); 
const express = require('express'); 
const axios = require("axios"); 

// Express Router for article routes
const articleRoutes = express.Router();

// Store scraped articles
let fetchedArticles = [];
// Timestamp to track the last scraping time
let lastScrapeTime = 0;
// Cooldown duration in milliseconds (6 hours)
const cooldownDuration = 21600000 * 2;

/**

/**
 * Function to scrape articles from a webpage.
 * Returns 
 * @param none
 * @returns {[]} title, image, articleUrl - a list of article objects containing title, image, and URL.
 */
const scrapeArticles = async (req, res) => {
  const currentTime = Date.now();

  // Check cooldown duration since the last scrape
  if (currentTime - lastScrapeTime >= cooldownDuration) {
    lastScrapeTime = currentTime; // Update last scrape time

    const url = 'https://pitchfork.com/news/';
    const numArticles = 10;

    try {
      // Fetch webpage content
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Extract article information using Cheerio
      fetchedArticles = $('.module.latest-module.collection-module.news-module.latest-module--horizontal')
        .slice(0, numArticles)
        .map((index, element) => {
          const title = $(element).find('h2').text();
          const image = $(element).find('img').attr('src');
          const articleUrl = $(element).find('a').attr('href'); // Fetching article URL

          return {
            title,
            image,
            articleUrl
          };
        })
        .get(); // Retrieve scraped data as an array

      return fetchedArticles; // Send articles as a response

    } catch (error) {
      // Handle scraping errors
      console.error('Error while scraping:', error);
      return []; // Return empty array if an error occurs
    }
  } else {
    // If cooldown duration hasn't passed, return previously fetched articles
    return fetchedArticles;
  }
};

// Express route to fetch and send articles
articleRoutes.get('/articles', async (req, res) => {
  try {
    const fetchedArticles = await scrapeArticles(); // Fetch articles
    res.send(fetchedArticles); // Send articles as a response
  } catch (error) {
    // Handle errors occurred during fetching articles
    console.error('Error while scraping:', error);
    res.status(500).send('Error while scraping articles');
  }
});

// Export the articleRoutes for use in other files
module.exports = articleRoutes;
