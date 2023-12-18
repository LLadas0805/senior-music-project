import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomCardResult from "./CustomCardResult.jsx";
import Loading from "./loading.jsx"
import './home.css'
import axios from "axios"
import Genres from "./genres.json";


const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function Home() {
    const [userData, setUserData] = useState(null);
    const [accessToken, setAccessToken] = useState("");
    const [newReleaseResults, setNewReleaseResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState([]);

    
    const spotifyEndpoints = 'https://api.spotify.com/v1/browse/new-releases?offset=0';

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    
      
      
     


    useEffect(() => {
        // Make an API call to fetch user data from the backend
        axios.get("http://localhost:3000/session")
          .then(response => {
            // Handle successful response
            setUserData(response.data); // Assuming the response contains user data
          })
          .catch(error => {
            // Handle error
            console.error("Error fetching user data:", error);
        });

        async function fetchData() {
            // Fetch access token once during component initialization
            const token = await fetchAccessToken();
            setAccessToken(token);
           
            // Fetch album data

            const newReleases = await performSearch(token, spotifyEndpoints);
            setNewReleaseResults(newReleases);
            

            
            



            

            setLoading(false); // Set loading to false when data is loaded
        }

        setGenres(shuffleArray(Genres.genres).slice(0, 6));

        fetchData();


    }, []);



    async function fetchAccessToken() {
        const authParameters = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        }
        const data = await fetch('https://accounts.spotify.com/api/token', authParameters)
            .then(result => result.json());
        return data.access_token;
    }

    async function performSearch(token, spotifyEndpoint = spotifyEndpoints) {
        const searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }

        try {
            const response = await fetch(spotifyEndpoint, searchParameters);
            if (response.ok) {
                return await response.json();
                
            }
            console.log(response)
        } catch (error) {
            console.error('Error searching:', error);
        }

        return {};
    }


    return (
        <div className = "background">
            <div className="homepage" style={{ color: 'white' }}>
                {loading ? (
                    <div className="caption-div">
                        <Loading/>
                    </div>
                ) : (
                <div className="search-results">

                    <div className="caption-div">
                    {userData ? (
                        <p className="caption type-caption">Welcome {userData.username}</p>
                        ) : (
                        <p className="caption type-caption">Hello, welcome to Harmony!</p>
                    )}
                    </div>

                    <div className="caption-div">
                        <p className="caption type-caption">New releases</p>
                    </div>
                    <CustomCardResult items={newReleaseResults.albums.items.slice(0, 6)} subtitleType="album" singleRow = {true}/>

                    <div className="caption-div">
                        <p className="caption type-caption">Explore genres</p>
                    </div>
                    <CustomCardResult items={genres} subtitleType="genre" singleRow = {true}/>

                </div>
                )}
        
            </div>
        </div>
    )
}

export default Home;