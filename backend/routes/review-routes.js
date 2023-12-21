const express = require('express');
const { reviews } = require('../mongoDB/mongo'); // Assuming 'collection' is your MongoDB collection model


const reviewRoutes = express.Router();


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
  

reviewRoutes.post("/user-reviews", async (req, res) => {
    const { id } = req.body;

    try {

            
        const checkReviews = await reviews.find({ userId:  id});

        res.json(checkReviews);

    } 
    catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

function validateScore(score) {
    // Check if the input is a number

    console.log(score);
    const isNumeric = /^\d+$/.test(score);

    // Check if the score is between 0 and 100
    const isInRange = score >= 0 && score <= 100;

    // Return true only if the score is numeric and within the valid range
    return isNumeric && isInRange;
}


reviewRoutes.post("/review", async (req, res) => {
    
    const { albumId, score, reviewBody } = req.body;
    
  
    if (!validateScore(score)) {
        res.json("Invalid score!");
    } else {
        const userId = req.session.user._id;
        const username = req.session.user.username;

        try {

            
            const checkReview = await reviews.findOne({ userId:  userId, albumId: albumId });
        
            if (checkReview) {
            
                const existReview = checkReview;
            

                const updatedReview = await reviews.findOneAndUpdate(
                    { user: userId },
                    { $set: { score: score, reviewbody: reviewBody } },
                    { new: true } // Return the updated document
                );

                
            
            } else {
                const data = {
                    albumId: albumId,
                    userId: userId,
                    username: username,
                    score: score,
                    reviewbody: reviewBody
                }

                const insertedReview = await reviews.insertMany(data); // Insert the user data

            }

            res.json("Valid score!");

            
        } catch (e) {
            console.error(e);
            res.status(500).json("An error occurred");
        }
    }
});




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


})


module.exports = reviewRoutes;
