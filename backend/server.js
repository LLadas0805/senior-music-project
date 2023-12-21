const express = require("express");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const {collection} = require("./mongoDB/mongo.js"); // Assuming 'collection' is your MongoDB collection model
const cors = require("cors");
const userRoutes = require('./routes/user-routes.js');
const reviewRoutes = require('./routes/review-routes.js');
const followerRoutes = require('./routes/follower-routes.js');
const articleRoutes = require('./routes/article-routes.js');
const spotifyRoutes = require('./routes/spotify-routes.js');

const path = require('path');
const app = express();



// Serve the static files from the 'frontend/build' directory
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

app.use(userRoutes);
app.use(reviewRoutes);
app.use(followerRoutes);
app.use(articleRoutes);
app.use(spotifyRoutes);

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


userRoutes.get("/logout", async (req, res) => {

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

// All other routes should serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// Server listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});