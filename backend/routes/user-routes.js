// Required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const { collection } = require('../mongoDB/mongo'); 

// Express Router for user routes
const userRoutes = express.Router();

// Number of milliseconds in a day and a month
const oneDayMilliseconds = 24 * 60 * 60 * 1000;
const oneMonthMilliseconds = oneDayMilliseconds * 30;

/**
 * Function to validate password complexity
 * @param {string} password - Password to be validated
 * @returns {boolean} - Returns true if the password meets the criteria, otherwise false
 */
function validatePassword(password) {
    // Regular expressions to match at least one number and one special character
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  
    // Check for minimum length
    const isLengthValid = password.length >= 8 && password.length <= 32;
  
    // Check if the password contains at least one number and one special character
    const hasNumber = numberRegex.test(password);
    const hasSpecialChar = specialCharRegex.test(password);
    const isNotEmpty = password.trim().length > 0;
  
    // Check all conditions
    return !!(isLengthValid && hasNumber && hasSpecialChar && isNotEmpty);
}

/**
 * Function to validate username/account name
 * @param {string} name - Username or account name to be validated
 * @returns {boolean} - Returns true if the name meets the criteria, otherwise false
 */
function validateUser(name) {
    // Check for minimum length and not empty
    const isLengthValid = name.length >= 3 && name.length <= 32;
    const isNotEmpty = name.trim().length > 0;
  
    // Check all conditions
    return !!(isLengthValid && isNotEmpty);
}

/**
 * Route to validate username/account name 
 * by matching credentials with existing ones 
 * in the MongoDB database, we save the session of the 
 * logged in user as a session document and part of a cookie
*/
userRoutes.post('/login', async (req, res) => {
    const { useroremail, password } = req.body;

  

    try {
        
        const checkAccount = await collection.findOne({ accountname:  useroremail  });
        console.log(checkAccount);

        if (checkAccount) {
            const account = checkAccount;

            if (bcrypt.compareSync(password, account.password)) {
                req.session.user = checkAccount;
                req.session.save();
                res.cookie('loggedInUser', req.session.user._id, { maxAge: oneMonthMilliseconds, httpOnly: false });
                res.json("exist");
            } else {
                res.json("incorrect password");
            }
        } else {
            res.json("user does not exist");
        }
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

/**
 * Route to create an account and if valid
 * input, we can store this information in 
 * out MongoDB database
*/
userRoutes.post('/signup', async (req, res) => {

    // Gets account information from frontend request
    const { user, account, password } = req.body;


    // Checks all conditions for signup credentials
    if (!validatePassword(password)) {
        res.json("invalid password");
    } else if (!validateUser(user)) {
        res.json("invalid username");
    } else if (!validateUser(account)) {
        res.json("invalid account name");
    } else {

        // Encrypts the password for security
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const data = {
            username: user,
            accountname: account,
            password: hash,
            token: ''
        }

        try {

            // Checks if user already exists, if it does we do not continue with our route
            const checkaccount = await collection.findOne({ accountname: account });

            if (checkaccount) {
                res.json("user already exists");
            } else {
                // If no account exists yet, we add user to our database and save their session
                const insertedUser = await collection.insertMany(data);
                req.session.user = insertedUser;
                req.session.save();
                res.cookie('loggedInUser', req.session.user._id, { maxAge: oneMonthMilliseconds, httpOnly: false });
                res.json("not exist");
            }
        } catch (e) {
            console.error(e);
            res.status(500).json("An error occurred");
        }
    }
});

/**
 * Route to return user information who is a specific ID
*/
userRoutes.post("/user", async (req, res) => {
    const { id } = req.body;

    try {
        const checkusername = await collection.findOne({ _id: id });
        res.json(checkusername);

    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

/**
 * Route to search for users by username
 */
userRoutes.post("/search", async (req, res) => {
    const { user } = req.body;

    try {
        const checkusername = await collection.find({ username: { $regex: new RegExp(user, 'i') } });
        res.json(checkusername);

    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

/**
 * Route to get all available users (limiting to 6)
 */
userRoutes.get("/available-users", async (req, res ) => {
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

module.exports = userRoutes;
