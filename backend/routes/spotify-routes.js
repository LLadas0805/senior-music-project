const express = require('express');
const spotifyRoutes = express.Router();
const { collection } = require('../mongoDB/mongo'); // Assuming 'collection' is your MongoDB collection model


spotifyRoutes.post('/spotify-auth', async (req, res) => {
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

  spotifyRoutes.post("/user-token", async (req, res) => {
    const { id } = req.body;
    
   

    try {
        
        const checkusername = await collection.findOne({ _id: id });
      
        res.send(checkusername.token);                                                    

        
    } catch (e) {
        console.error(e);
        res.status(500).json("An error occurred");
    }


});

spotifyRoutes.get("/spotify-logout", async (req, res) => {
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


module.exports = spotifyRoutes;