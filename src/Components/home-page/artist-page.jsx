import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Container } from "react-bootstrap";
import UserIcon from '../Assets/Icons/UserIcon.png';
import './profile.css'
import './home.css'

const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function ArtistPage() {
    const [artistResults, setArtistResults] = useState({});
    const [accessToken, setAccessToken] = useState("");
    const { artistId } = useParams(); // Get the artistId from the URL
    const spotifyEndpoint = `https://api.spotify.com/v1/artists/${artistId}`;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // Fetch access token once during component initialization
            const token = await fetchAccessToken();
            setAccessToken(token);
            // Fetch artist data
            const artistData = await performSearch(token);
            setArtistResults(artistData);
            setLoading(false); // Set loading to false when data is loaded
        }

        fetchData();
    }, [artistId]); // Make sure to update the data when artistId changes

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

    async function performSearch(token) {
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
        <div>
            <div className="">
                {loading ? (
                    <p>Loading artist information...</p>
                ) : (
                    <div>
                        <div className="profile-head mb-5">
                            <div>
                                <img src={artistResults.images?.[0]?.url || UserIcon} className="artist-image profile-image mb-3" />
                            </div>
                            <div>
                                <h1 className="caption profile-caption">{artistResults.name}</h1>
                            </div>
                            <div>
                            {artistResults.genres && artistResults.genres.length > 0 ? (
                            <div>
                                
                                <div className="genre-list">
                                {artistResults.genres.map((genre, index) => (
                                    <a key={index}  className="genre-link">
                                    {genre}
                                    </a>
                                ))}
                                </div>
                            </div>
                            ) : (
                            <p>No genres found for this artist.</p>
                            )}
                            </div>
                        </div>

                        <div className = "profile-body">
                            <div className = "top-songs">
                                <h1 className = "caption profile-caption">Popular songs</h1>


                            </div>
                        </div>

                    </div>
                       
                    

                )}
            </div>
        </div>
    );
}

export default ArtistPage;



  