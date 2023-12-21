import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomCardResult from "../../card-lists/CustomCardResult.jsx";
import Loading from "../../misc-page/loading.jsx"
import './home.css'
import axios from "axios"
import Genres from "../../search-page/genres.json";
import PitchforkArticles from '../../card-lists/articles.jsx'; // Adjust the path accordingly
import UserReviewResults from "../../reviews/user-review-results.jsx"


const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function Home() {
    const [userData, setUserData] = useState(null);
    const [accessToken, setAccessToken] = useState("");
    const [userToken, setUserToken] = useState("");
    const [newReleaseResults, setNewReleaseResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState([]);
    const [featuredReview, setFeaturedReview] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);

    
    const spotifyEndpoints = 'https://api.spotify.com/v1/browse/new-releases?offset=0';

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    

    const handleCodeExchange = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
    
            console.log("CODE: ", code);
    
            if (code) {
                const response = await fetch('/spotify-auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('Updated user data:', data);
                    // Perform any action with the updated data
                } else {
                    throw new Error('Failed to update user data');
                }
            } else {
                throw new Error('No authorization code found');
            }
        } catch (error) {
            console.error('Error occurred:', error);
            // Handle errors as needed
        }
    };
    
      
      
     


    useEffect(() => {

        handleCodeExchange();


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

        // Make an API call to fetch user data from the backend
        axios.get("http://localhost:3000/featured-reviews")
          .then(response => {

            console.log("RESPONSE DATA: ", response.data);
            // Handle successful response
            setFeaturedReview(response.data); // Assuming the response contains user data
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

            axios.get("http://localhost:3000/available-users")
                .then(response => {
                // Handle successful response
                setAvailableUsers(response.data); // Assuming the response contains user data
                console.log(response.data)
                })
                .catch(error => {
                // Handle error
                console.error("Error fetching user data:", error);
                setAvailableUsers([]); 
            });

           
            


            
            



            

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
                        <p className="caption type-caption mb-3">Welcome {userData.username}!</p>
                        ) : (
                        <p className="caption type-caption mb-3">Hello, welcome to my Senior Project!</p>
                    )}
                    </div>

                    <div className="caption-div">
                        <p className="caption type-caption">New releases</p>
                    </div>
                    <CustomCardResult items={newReleaseResults.albums.items.slice(0, 6)} subtitleType="album" singleRow = {true}/>

                    <div className="caption-div">
                        <p className="caption type-caption">Featured reviews</p>
                    </div>

                    {featuredReview.length !== 0 ? (
                        <UserReviewResults reviews = {featuredReview}/>
                        ) : (
                        <div className="caption-div">
                            <p className="caption type-caption">No reviews available</p>
                        </div>
                    )}

                    <div className="caption-div">
                        <p className="caption type-caption">Explore genres</p>
                    </div>
                    <CustomCardResult items={genres} subtitleType="genre" singleRow = {true}/>

                    <div className="caption-div">
                        <p className="caption type-caption">Browse current events</p>
                    </div>
                    <PitchforkArticles className = "mb-3"/>


                    {availableUsers.length !== 0 && (
                        <>
                        <div className="caption-div mt-3">
                            <p className="caption type-caption">Discover users</p>
                        </div>
                        <CustomCardResult items={availableUsers} subtitleType="user" singleRow = {true}/>
                        </>
                    )}
                    <div className = "mb-3"> 
                    </div>

                </div>
                )}
        
            </div>
        </div>
    )
}

export default Home;