const express = require("express")
const collection = require("./mongo")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())



app.get("/", cors(), (req, res)=>{

})

app.post("/", async (req, res) => {
    const { useroremail, password } = req.body;

    try {
        const checkemail = await collection.findOne({email:useroremail})
        const checkusername = await collection.findOne({username:useroremail})
        if (checkemail || checkusername) {
            res.json("exist");
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
    const { user, email, password } = req.body;

    const data = {
        username: user,
        email: email,
        password: password
    }

    try {
        const checkemail = await collection.findOne({ email: email });
        const checkusername = await collection.findOne({ username: user });
        if (checkemail || checkusername) {
            res.json("exist");
        } else {
            console.log("Helloworld");
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