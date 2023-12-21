// Required modules
const express = require('express');
const { reviews } = require('../mongoDB/mongo'); 

// Express Router for review routes
const reviewRoutes = express.Router();

/**
 * Route to fetch featured reviews
 */
reviewRoutes.get("/featured-reviews", async (req, res) => {
    try {
        const checkReviews = await reviews
            .find({ score: { $gte: 75 }, reviewbody: { $ne: '' } })
            .sort({ createdAt: -1 }) // Sort in descending order based on createdAt field
            .limit(3); // Limit the result to 3 documents

        if (!checkReviews) {
            console.log('No reviews found matching the criteria.');
            return res.status(404).json({ error: 'No featured reviews found.' });
        }

        // Send the random review in the response
        res.status(200).json(checkReviews);
    } catch (err) {
        console.error('Error occurred while finding a random review:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Route to fetch reviews by a specific user
 */
reviewRoutes.post("/user-reviews", async (req, res) => {
    const { id } = req.body;

    // Checks if user reviews even exist
    try {
        const checkReviews = await reviews.find({ userId: id });
        res.json(checkReviews);
    } catch (e) {
    
        // Logs an error if not
        console.error(e);
        res.status(500).json("An error occurred");
    }
});


/**
 * Function to validate score input
 * @param {string} score - score that will be validated
 * @returns {boolean} - Returns true if the score meets the criteria, otherwise false
 */
function validateScore(score) {
    // Check if the input is a number
    console.log(score);
    const isNumeric = /^\d+$/.test(score);

    // Check if the score is between 0 and 100
    const isInRange = score >= 0 && score <= 100;

    // Return true only if the score is numeric and within the valid range
    return isNumeric && isInRange;
}

/**
 * Route to add or update a review for an album by a user
 */
reviewRoutes.post("/review", async (req, res) => {
    const { albumId, score, reviewBody } = req.body;

    if (!validateScore(score)) {
        res.json("Invalid score!");
    } else {
        const userId = req.session.user._id;
        console.log(userId);
        const username = req.session.user.username;

        try {
            // Check if the user has already reviewed the album
            const checkReview = await reviews.findOne({ userId: userId, albumId: albumId });

            if (checkReview) {
                // We update the existing review
                const existReview = checkReview;


                const updatedReview = await reviews.findOneAndUpdate(
                    { userId: userId },
                    { $set: { score: score, reviewbody: reviewBody } },
                    { new: true } // Return the updated document
                );

                console.log(updatedReview)
            } else {
                // We create a new review document if none exists already
                const data = {
                    albumId: albumId,
                    userId: userId,
                    username: username,
                    score: score,
                    reviewbody: reviewBody
                };

                const insertedReview = await reviews.insertMany(data); // Insert the user data
            }

            res.json("Valid score!");
        } catch (e) {

            // Output error
            console.error(e);
            res.status(500).json("An error occurred");
        }
    }
});

/**
 * Route to fetch reviews for a specific album
 */
reviewRoutes.post("/album-reviews", async (req, res) => {
    const { albumId } = req.body;

    console.log(albumId);

    try {
        const checkReviews = await reviews.find({ albumId: albumId });
        res.json(checkReviews);

    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

// Export the reviewRoutes for use in other files
module.exports = reviewRoutes;
