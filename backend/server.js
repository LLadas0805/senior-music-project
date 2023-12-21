// Required modules
const express = require("express");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const { collection } = require("./mongoDB/mongo.js"); 
const cors = require("cors");
const userRoutes = require('./routes/user-routes.js');
const reviewRoutes = require('./routes/review-routes.js');
const followerRoutes = require('./routes/follower-routes.js');
const articleRoutes = require('./routes/article-routes.js');
const spotifyRoutes = require('./routes/spotify-routes.js');
const path = require('path');
const app = express();

// Serve the static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

// MongoDB URL
const mongoUrl = "mongodb+srv://lladas:Chippie_0805@cluster0.5zzqisk.mongodb.net/?retryWrites=true&w=majority";

// Time configurations
const oneDayMilliseconds = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
const oneMonthMilliseconds = oneDayMilliseconds * 30; // Approximate number of milliseconds in a month

// Create a new MongoDBStore instance
const store = new MongoDBStore({
    uri: mongoUrl,
    collection: 'sessions'
});

store.on('error', function (error) {
    console.log(error);
});

// Middleware setup
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

// Middleware to handle user session
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = {
            id: req.session.user._id,
            accountname: req.session.user.accountname
        };
    }
    next();
});

// Registering routes
app.use(userRoutes);
app.use(reviewRoutes);
app.use(followerRoutes);
app.use(articleRoutes);
app.use(spotifyRoutes);

/*
* Checks to see if the current user page is the same as session user
*/ 
app.post("/user-authenticate", async (req, res) => {
    const { id } = req.body;
    try {
        if (id === req.session.user._id.toString()) {
            res.send(true);
        } else {
            res.send(false);
        }
    } catch (e) {
        console.error(e);
        res.status(500).send(false);
    }
});

/*
* Session route to retrieve logged-in user's data
*/ 
app.get("/session", async (req, res) => {
    try {
        const loggedInUserId = req.cookies.loggedInUser;
        if (loggedInUserId) {
            const checkAccount = await collection.findOne({ _id: loggedInUserId });
            req.session.user = checkAccount;
            await req.session.save();
            res.json(checkAccount);
        } else {
            res.status(404).json("No session found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json("An error occurred");
    }
});

/*
* Logs session user out, clearing cookie and destroying session in MongoDB
*/ 
userRoutes.get("/logout", async (req, res) => {
    if (req.session) {
        const sessionId = req.session.id;
        store.destroy(sessionId, (err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Error destroying session');
            } else {
                req.session = null;
                res.clearCookie('loggedInUser');
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/*
* Route to serve the React app for all other routes
*/ 
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// Server listening on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
