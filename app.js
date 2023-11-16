const express = require("express")
const session = require('express-session');
const collection = require("./mongo")
const cors = require("cors")
const app = express()
const bcrypt = require('bcryptjs');
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())



app.get("/", cors(), (req, res)=>{

})

// Add express-session middleware
app.use(session({
    secret: 'lukeadmin',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



app.use((req, res, next) => {
    
    if (req.session.user) {
        console.log("Hello!");
        res.locals.user = {
            id: req.session.user._id,
            accountname: req.session.user.accountname
        }
    }
    next()
})


    
app.post("/home", async (req, res) => {
    const { user } = req.body;
    console.log(user);

    try {
        
        const checkusername = await collection.find({ username: { $regex: new RegExp(user, 'i') } });
        res.json(checkusername);                                                    

        
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});


  




app.post("/", async (req, res) => {
    const { useroremail, password } = req.body;

    try {
        const checkEmail = await collection.findOne({ email: { $regex: new RegExp(`^${useroremail}$`, 'i') } });
        
        const checkAccount = await collection.findOne({ accountname: { $regex: new RegExp(useroremail, 'i') } });
     
        if (checkEmail || checkAccount) {
            console.log("true")
            const user = checkEmail || checkAccount;

            // Compare the provided password with the stored hashed password
            if (bcrypt.compareSync(password, user.password)) {
                // Passwords match
                req.session.user = user;
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
    console.log("hello")
    console.log(req.body)
    const { user, account, email, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const data = {
        username: user,
        accountname: account,
        email: email,
        password: hash
    }

    try {
        const checkemail = await collection.findOne({ email: email });
        const checkaccount = await collection.findOne({ account: account });
        if (checkemail || checkaccount) {
            res.json("exist");
        } else {

            
            req.session.user = user;
            await collection.insertMany([data]);
            res.json("not exist");
        }
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }
});

app.listen(3000, ()=>{
    console.log("port connected")
})

