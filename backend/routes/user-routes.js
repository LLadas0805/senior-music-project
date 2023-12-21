const express = require('express');
const bcrypt = require('bcryptjs');
const { collection } = require('../mongoDB/mongo'); // Assuming 'collection' is your MongoDB collection model


const userRoutes = express.Router();


const oneDayMilliseconds = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
const oneMonthMilliseconds = oneDayMilliseconds * 30; // Approximate number of milliseconds in a month

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



function validateUser(name) {
    // Regular expressions to match at least one number and one special character
    
  
    // Check for minimum length
    const isLengthValid = name.length >= 3 && name.length <= 32;

    const isNotEmpty = name.trim().length > 0;
  
    
    
  
    // Check all conditions
    return !!(isLengthValid && isNotEmpty);
}

// Login Route
userRoutes.post('/login', async (req, res) => {
    const { useroremail, password } = req.body;

    try {
        const checkAccount = await collection.findOne({ accountname: { $regex: new RegExp(useroremail, 'i') } });

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

// Signup Route
userRoutes.post('/signup', async (req, res) => {
    const { user, account, password } = req.body;

    if (!validatePassword(password)) {
        res.json("invalid password");
    } else if (!validateUser(user)) {
        res.json("invalid username");
    } else if (!validateUser(account)) {
        res.json("invalid account name");
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

            if (checkaccount) {
                res.json("user already exists");
            } else {
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

// Routes
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
