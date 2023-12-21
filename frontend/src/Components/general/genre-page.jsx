// Import modules, components and images
import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import './profile.css'
import './home.css'
import { ColorExtractor  } from 'react-color-extractor';
import CustomCardResult from "./CustomCardResult.jsx";
import GenreIcon from '../Assets/Icons/GenreIcon.png'
import Loading from "./loading.jsx"
import NotFound from "./not-found.jsx"
import textFit from 'textfit';

// Spotify API credentials
const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function GenrePage() {
    // State variables
    const [genreResults, setGenreResults] = useState([]);
    const [accessToken, setAccessToken] = useState("");
    const { genreId } = useParams(); // Get the genreId from the URL
    const spotifyEndpoints = `https://api.spotify.com/v1/recommendations?seed_genres=${genreId}`;
    const [loading, setLoading] = useState(true);
    const [extractedColors, setExtractedColors] = useState([]);
    const [genreTracks, setGenreTracks] = useState([])
    const [gradientString, setGradientString] = useState('');
    const [bodyGradient, setBodyGradient] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');

    // Function to handle tab click and set the active tab
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleGetColors = (colors) => {
        // Store the extracted colors in state
        setExtractedColors(colors[2]);
        const startColor = colors[2];
        const darkerColor = darkenColor(startColor, 0.5); // Darken the color 
        const gradient = `linear-gradient(to bottom, ${startColor}, ${darkerColor})`;
        setGradientString(gradient);
        const bodyDark = darkenColor(startColor, 0.6);
        const bodyGradient = `linear-gradient(to bottom, ${bodyDark} , #201d24,#201d24, #201d24 )`
        setBodyGradient(bodyGradient)
    };

    // Function to darken a color
    const darkenColor = (color, amount) => {
        // Remove the "#" symbol from the color string and split it into RGB components
        const [r, g, b] = color.substring(1).match(/.{2}/g).map((value) => parseInt(value, 16));
    
        // Calculate a darker shade by reducing RGB values
        const darkerR = Math.round(r * (1 - amount));
        const darkerG = Math.round(g * (1 - amount));
        const darkerB = Math.round(b * (1 - amount));
    
        // Construct a new color string in hexadecimal format
        return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    };
    
    useEffect(() => {
        async function fetchData() {
            // Fetch access token once during component initialization
            const token = await fetchAccessToken();
            setAccessToken(token);
            // Fetch genre data
            const genreData = await performSearch(token, spotifyEndpoints);
            setGenreResults(genreData);
            setGenreTracks(genreData.tracks);
            setLoading(false); // Set loading to false when data is loaded
        }

        fetchData();
        textFit(document.getElementsByClassName('profile-name')); // Fit text to element
        
    }, [genreId]); // Update data when genreId changes

    // Function to fetch access token
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

    // Function to perform Spotify API search
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

        return [];
    }

    // Styles for links
    const linkStyles = {
        textDecoration: 'none', // Remove underline
        color: 'inherit', // Inherit the color from the parent
    };

      return (
        <div>
            <div className="page-body">
                {loading ? (
                    <Loading/>
                ) : (
                    genreResults.tracks.length === 0 ? (
                        <NotFound/>
                    ) : (
                        <div>
                            <ColorExtractor
                                src={GenreIcon}
                                getColors={handleGetColors}
                            />
                            <div className="profile-head" style={{ background: gradientString }}>
                                <div className="column-left">
                                    <div className="artist-image-container">
                                        <img src={GenreIcon} className="card-image profile-image mb-3" />
                                    </div>
                                </div>
                                <div className="column-right">
                                    <div className="profile-name" id="profile-name">
                                        <h1 className="profile-caption" id="profile-caption">
                                            {genreId.charAt(0).toUpperCase() + genreId.slice(1)}
                                        </h1>
                                    </div>
                                    <div>
                                        <h1 className="caption type-caption">Genre</h1>
                                    </div>
    
                                    <div>
                                        <div>
                                            <div className="genre-list">
                                                <h1 className="artist-link">
                                                    {/* Content to be inserted */}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <div className="profile-body" style={{ background: bodyGradient }}>
                                <div className="profile-body-expand">
                                    <div className="top-songs top-tabs pb-3 pt-3">
                                        <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Overview' ? 'active-profile' : ''}`} 
                                            onClick={() => handleTabClick('Overview')}>Overview</h1>
                                    </div>
    
                                    {activeTab === 'Overview' && (
                                        // Content related to Overview tab
                                        <div className="content-overview">
                                            <div className="caption-div">
                                                <p className="caption type-caption">Recommended tracks for {genreId}</p>
                                            </div>
                                            <CustomCardResult items={genreTracks} subtitleType="song" singleRow={false} />
    
                                           
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
    
}

export default GenrePage;



  