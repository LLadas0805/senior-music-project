const express = require('express');
const { collection } = require('../mongoDB/mongo.js');
const { ObjectId } = require('mongodb');

const followerRoutes = express.Router();



followerRoutes.post("/show-followers", async (req, res) => {
    const { id, type } = req.body;


    try {
        // Find all users who are following the specified entity_id and entity_type
        const followers = await collection.find({
            "following": {
                $elemMatch: {
                    "entity_id": Object(id),
                    "entity_type": type
                }
            }
        });

        if (!followers || followers.length === 0) {
            return res.status(404).json({ message: "No followers found for the specified entity." });
        }

        // Extract the list of followers' IDs
        const followerIds = followers.map(follower => follower._id);

        return res.status(200).json({ followerIds });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

followerRoutes.post("/show-following", async (req, res) => {
    const { id } = req.body;

    try {
        // Find the user by their ID
        const user = await collection.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Get all entities that the user is following
        const followingEntities = user.following;

        if (followingEntities.length === 0) {
            return res.status(404).json({ message: `User ${id} is not following any entities.` });
        }

        // Prepare the list of entities the user is following with their types
        const followingList = followingEntities.map(entity => ({
            entity_id: entity.entity_id,
            entity_type: entity.entity_type
        }));

        console.log("Following List: ", followingList)

        return res.status(200).send({ followingList });
    } catch (error) {
        console.error("Error fetching following:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});




followerRoutes.post("/change-follower", async (req, res) => {
    const { id, type } = req.body;
    const loggedInUserId = req.cookies.loggedInUser;

    try {
        if (!loggedInUserId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        // Check if loggedInUserId exists in the database
        const checkAccount = await collection.findOne({ _id: loggedInUserId });

        if (!checkAccount) {
            return res.status(404).json({ message: "User not found." });
        }

        const isFollowing = checkAccount.following.some(follow =>
            follow.entity_id.toString() === id && follow.entity_type === type
        );

        if (!isFollowing) {
            // Add the entity to user's following list if not already following
            checkAccount.following.push({ entity_id: id, entity_type: type });
            await checkAccount.save();
            return res.status(200).send(`Follow`);
        } else {
            // Remove the entity from user's following list if already following
            checkAccount.following = checkAccount.following.filter(follow =>
                !(follow.entity_id.toString() === id && follow.entity_type === type)
            );
            await checkAccount.save();
            return res.status(200).send(`Unfollow`);
        }

    } catch (error) {
        console.error("Error changing follower:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

followerRoutes.post("/follow-status", async (req, res) => {
    const { id, type } = req.body;
    const loggedInUserId = req.cookies.loggedInUser;

    try {
        if (!loggedInUserId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        // Find the logged-in user
        const user = await collection.findOne({ _id: loggedInUserId });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const newObject = ObjectId(id); // Assuming id is a string
      

        // Check if the logged-in user is following the specified entity
        const isFollowing = user.following.some(follow => {
         

            return follow.entity_id.equals(newObject) && follow.entity_type === type;
        });


        

        // Return follow status message
        const followMessage = isFollowing ? 'Unfollow' : 'Follow';
        

        return res.status(200).send(followMessage)

    } catch (error) {
        console.error("Error checking follow status:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = followerRoutes;