const cheerio = require('cheerio');
const express = require('express');
const axios = require("axios");


const articleRoutes = express.Router();

let fetchedArticles = []; // Store scraped articles
let lastScrapeTime = 0; // Timestamp to track the last scraping time
const cooldownDuration = 21600000 * 2; // Cooldown duration in milliseconds (6 hour)

// Function to scrape data from the webpage
const scrapeArticles = async (req, res) => {
  const currentTime = Date.now();

  if (currentTime - lastScrapeTime >= cooldownDuration) {
    lastScrapeTime = currentTime; // Update last scrape time

    const url = 'https://pitchfork.com/news/';
    const numArticles = 10;

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

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
        .get(); // Retrieve the scraped data as an array

      return fetchedArticles; // Send articles as a response

    } catch (error) {
        
    }
  } else {
    return fetchedArticles; // Send articles as a response

  }
};



// Express route to fetch and send articles
articleRoutes.get('/articles', async (req, res) => {
    try {
      const fetchedArticles = await scrapeArticles(); // Fetch articles
      res.send(fetchedArticles); // Send articles as a response
    } catch (error) {
      console.error('Error while scraping:', error);
      res.status(500).send('Error while scraping articles');
    }
});


module.exports = articleRoutes;