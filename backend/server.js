const express = require("express");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const collection = require("./mongo"); // Assuming 'collection' is your MongoDB collection model
const cors = require("cors");
const bcrypt = require('bcryptjs');

const path = require('path');
const app = express();


// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

const mongoUrl = "mongodb+srv://lladas:Chippie_0805@cluster0.5zzqisk.mongodb.net/?retryWrites=true&w=majority";

const store = new MongoDBStore({
    uri: mongoUrl,
    collection: 'sessions'
});

store.on('error', function (error) {
    console.log(error);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'lukeadmin',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { secure: false }
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

app.post("/", async (req, res) => {
    
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

app.post("/signup", async (req, res) => {
   
  
    const { user, account, password } = req.body;
    

    if (!validatePassword(password)) {
        res.json("invalid password");
    } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const data = {
            username: user,
            accountname: account,
            password: hash
        }

        try {
            const checkaccount = await collection.findOne({ account: account });
            if (checkaccount) {
                res.json("exist");
            } else {

                
                
                const insertedUser = await collection.insertMany(data); // Insert the user data
                req.session.user = insertedUser; // Set req.session.user with the inserted user
                req.session.save(); // Save the session
                res.json("not exist");
            }
        } catch (e) {
            console.error(e);
            res.status(500).json("An error occurred");
        }
    }
});

app.get("/session", async (req, res) => {

    if (req.session.user) {
        res.json(req.session.user);
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



