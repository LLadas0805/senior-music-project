const express = require("express");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { ObjectId } = require('mongodb'); // Import ObjectId from the mongodb package
const cookieParser = require('cookie-parser');
const {collection, reviews} = require("./mongo"); // Assuming 'collection' is your MongoDB collection model
const cors = require("cors");
const bcrypt = require('bcryptjs');
const cheerio = require('cheerio');
const axios = require('axios'); // Add this line to import axios
const path = require('path');
const app = express();


// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

const mongoUrl = "mongodb+srv://lladas:Chippie_0805@cluster0.5zzqisk.mongodb.net/?retryWrites=true&w=majority";

const oneDayMilliseconds = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
const oneMonthMilliseconds = oneDayMilliseconds * 30; // Approximate number of milliseconds in a month

const store = new MongoDBStore({
    uri: mongoUrl,
    collection: 'sessions'
});

store.on('error', function (error) {
    console.log(error);
});

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'lukeadmin',
    resave: true,
    saveUninitialized: false,
    store: store,
    cookie: { secure: false, maxAge: oneMonthMilliseconds }
}));

// Session handling middleware
app.use((req, res, next) => {
  
    if (req.session.user) {
        res.locals.user = {
            id: req.session.user._id,
            accountname: req.session.user.accountname
        };
    }
    next();
});




app.post('/spotify-auth', async (req, res) => {
  console.log("Redirect test....")
  const { code } = req.body; // Get the authorization code from the callback URL

  console.log("REQ QUERY: ", code)
  
  try {
    const clientId = '5d8c84c59ac8435e91aa1c9d5d2e9706';
    const clientSecret = '93799cce40b641bb951a9b6966e3f2c0';
    const redirectUri = 'http://localhost:3000/'; // Must match the redirect URI used above

    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('code', code);
    data.append('redirect_uri', redirectUri);
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);

    const response = await axios.post('https://accounts.spotify.com/api/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log("RES DATA: ", response.data)

    const { access_token, refresh_token } = response.data;
    // Store the access_token and refresh_token securely (e.g., in a database)
    
    const loggedInUserId = req.cookies.loggedInUser;

    if (loggedInUserId) {
      const updatedAccount = await collection.findOneAndUpdate(
        { _id: loggedInUserId },
        { $set: { token: refresh_token } },
        { new: true } // Return the updated document
      );

      req.session.user = updatedAccount;
      await req.session.save(); // Save the session

      res.json(updatedAccount); // Sending the user data back as a response
    }
  } catch (error) {
    console.log("Epic failure:", error.message);
    res.status(500).send('Error occurred while exchanging code for tokens');
  }
});







app.post("/show-followers", async (req, res) => {
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

app.post("/show-following", async (req, res) => {
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




app.post("/change-follower", async (req, res) => {
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

app.post("/follow-status", async (req, res) => {
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





  
  

// Routes
app.post("/search", async (req, res) => {
    const { user } = req.body;
   

    try {
        
        const checkusername = await collection.find({ username: { $regex: new RegExp(user, 'i') } });
        res.json(checkusername);                                                    

        
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

app.post("/user", async (req, res) => {
    const { id } = req.body;
   
   

    try {
        
        const checkusername = await collection.findOne({ _id: id });
      
        res.json(checkusername);                                                    

        
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

app.get("/featured-reviews", async (req, res) => {
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
  

app.post("/user-reviews", async (req, res) => {
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


app.post("/user-authenticate", async (req, res) => {
    const { id } = req.body;
    
   

    try {
        
      
      
        if (id === req.session.user._id.toString()) {
          
            res.send(true)
        } else {
            res.send(false)
        }                                                 

        
    } catch (e) {
        console.error(e);
        res.status(500).send(false);
    }
});


app.post("/user-token", async (req, res) => {
    const { id } = req.body;
    
   

    try {
        
        const checkusername = await collection.findOne({ _id: id });
      
        res.send(checkusername.token);                                                    

        
    } catch (e) {
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


app.post("/review", async (req, res) => {
    
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

function validatePassword(password) {
     // Regular expressions to match at least one number and one special character
     const numberRegex = /[0-9]/;
     const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
   
     // Check for minimum length
     const isLengthValid = password.length >= 8;
   
     // Check if the password contains at least one number and one special character
     const hasNumber = numberRegex.test(password);
     const hasSpecialChar = specialCharRegex.test(password);
   
     // Check all conditions
     return !!(isLengthValid && hasNumber && hasSpecialChar);
}

app.post("/album-reviews", async (req, res) => {
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


app.post("/login", async (req, res) => {
    
    const { useroremail, password } = req.body;
  
    

    try {

        
        const checkAccount = await collection.findOne({ accountname: { $regex: new RegExp(useroremail, 'i') } });
     
        if (checkAccount) {
          
            const account = checkAccount;
          

            // Compare the provided password with the stored hashed password
            if (bcrypt.compareSync(password, account.password)) {
                // Passwords match
                req.session.user = checkAccount;
                req.session.save()
               
                res.cookie('loggedInUser', req.session.user._id, { maxAge: oneMonthMilliseconds, httpOnly: false }); 
                
                res.json("exist");
            } else {
                // Passwords do not match
                res.json("incorrect");
            }


          
        } else {
            res.json("not exist");

        }

        
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

app.post("/signup", async (req, res) => {
   
  
    const { user, account, password } = req.body;
    console.log(user, account, password)
    

    if (!validatePassword(password)) {
        res.json("invalid password");
    } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const data = {
            username: user,
            accountname: account,
            password: hash,
            token: ''

        }

        try {
            const checkaccount = await collection.findOne({ accountname: account });
            console.log(checkaccount)

            if (checkaccount) {
                res.json("exist");
            } else {

                
                
                const insertedUser = await collection.insertMany(data); // Insert the user data
                req.session.user = insertedUser; // Set req.session.user with the inserted user
                console.log("REQ USER:", req.session.user);
                req.session.save(); // Save the session
                res.cookie('loggedInUser', req.session.user._id, { maxAge: oneMonthMilliseconds, httpOnly: false }); 
                res.json("not exist");
            }
        } catch (e) {
            console.error(e);
            res.status(500).json("An error occurred");
        }
    }
});

app.get("/session", async (req, res) => {
    try {
        const loggedInUserId = req.cookies.loggedInUser;
     

        if (loggedInUserId) {
            const checkAccount = await collection.findOne({ _id: loggedInUserId });
        

            req.session.user = checkAccount;
            await req.session.save(); // Save the session

          

            res.json(checkAccount); // Sending the user data back as a response
        } else {
            res.status(404).json("No session found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json("An error occurred");
    }
});


app.get("/spotify-logout", async (req, res) => {
    try {
        const loggedInUserId = req.cookies.loggedInUser;

        if (loggedInUserId) {
            const filter = { _id: loggedInUserId };
            const update = { $set: { token: '' } };

            const updatedAccount = await collection.findOneAndUpdate(filter, update, { returnOriginal: false });

            if (updatedAccount) {
                req.session.user = updatedAccount;
                req.session.save(); // Save the session

                return res.status(200).send("logout");
            } else {
                return res.status(404).json("No account found with the provided ID");
            }
        } else {
            return res.status(404).json("No session found");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json("An error occurred");
    }
});


app.get("/available-users", async (req, res ) => {
   
        try {
           
         
    
          
            const checkAccounts = await collection.find().limit(6);

            if (checkAccounts) {
                res.json(checkAccounts); // Sending the user data back as a response
            } else {
                res.status(404).json("No users found");
            }

                
            
    

    
              
    
                

        } catch (error) {
            console.error(error);
            res.status(500).json("An error occurred");
        }
    
});



app.get("/logout", async (req, res) => {

    if (req.session) {
        const sessionId = req.session.id; // Get the session ID
        
        // Destroy the session from the MongoDBStore based on the session ID
        store.destroy(sessionId, (err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Error destroying session');
            } else {
                req.session = null; // Clear the session data in memory
                res.clearCookie('loggedInUser'); // Clear the cookie named 'loggedInUser'
                res.redirect('/'); // Redirect to home or another page after logout
            }
        });
    } else {
    res.redirect('/'); // Redirect if no session is found
    }

});


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
app.get('/articles', async (req, res) => {
    try {
      const fetchedArticles = await scrapeArticles(); // Fetch articles
      res.send(fetchedArticles); // Send articles as a response
    } catch (error) {
      console.error('Error while scraping:', error);
      res.status(500).send('Error while scraping articles');
    }
});





// All other routes should serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});




// Server listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



