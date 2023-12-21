// Import modules, components and images
import React, { useState, useEffect } from "react";
import { useParams, Link  } from 'react-router-dom';
import UserIcon from '../Assets/Icons/UserIcon.png';
import './profile.css'
import './home.css'
import { ColorExtractor  } from 'react-color-extractor';
import PlaylistTracklist from "./PlaylistTracklist.jsx"
import GenreIcon from '../Assets/Icons/GenreIcon.png'
import Loading from "./loading.jsx"
import NotFound from "./not-found.jsx"
import textFit from 'textfit';

// Spotify API credentials
const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function PlaylistPage() {
    // State variables
    const [playlistResults, setPlaylistResults] = useState({});
    const [playlistTracks, setPlaylistTracks] = useState({});
    const [accessToken, setAccessToken] = useState("");
    const { playlistId } = useParams(); // Get the albumId from the URL
    const spotifyEndpoints = `https://api.spotify.com/v1/playlists/${playlistId}`;
    const [loading, setLoading] = useState(true);
    const [extractedColors, setExtractedColors] = useState([]);
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
           
            // Fetch album data

            const playlistData = await performSearch(token, spotifyEndpoints);
            setPlaylistResults(playlistData);
            console.log(playlistData);

            
            setPlaylistTracks(playlistData.tracks)
            console.log(playlistData.tracks);

            setLoading(false); // Set loading to false when data is loaded
        }

        fetchData();
        textFit(document.getElementsByClassName('profile-name'));

    }, [playlistId]); // Make sure to update the data when albumId changes

   

 
    // Gets in the total tracks from a playlist and calculates total track time
    function formatDuration(playlistTracks) {

        
        let totalDuration = 0;
    
      
        playlistTracks.map(item => {
            if (item.track.duration_ms) {
                totalDuration += item.track.duration_ms;
            }
        });
      
    
        const totalSeconds = Math.floor(totalDuration / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let formattedDuration = ''
        
        if (hours > 0) {
            formattedDuration = `${hours.toString()} hr ${minutes.toString()} min`;
        } else {
            formattedDuration = ` ${minutes.toString()} min ${seconds.toString()} sec`;
        }
        
    
        return formattedDuration;
    }
   
    // Collects the access token for the Spotify API
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

    // Searches for data at a given endpoint on the Spotify API
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

    const linkStyles = {
        textDecoration: 'none', // Remove underline
        color: 'inherit', // Inherit the color from the parent
      };

      return (
        <div className="page-body">
            {loading ? (
                <Loading />
            ) : playlistResults.length === 0 ? (
                <NotFound />
            ) : (
                <div>
                    <ColorExtractor
                        src={playlistResults.images?.[0]?.url || GenreIcon}
                        getColors={handleGetColors}
                    />
                    <div className="profile-head" style={{ background: gradientString }}>
                        <div className="column-left">
                            <div className="artist-image-container">
                                <img
                                    src={playlistResults.images?.[0]?.url || UserIcon}
                                    className="card-image profile-image mb-3"
                                />
                            </div>
                        </div>
                        <div className="column-right">
                            <div className="profile-name" id="profile-name">
                                <h1 className="profile-caption" id="profile-caption">
                                    {playlistResults.name}
                                </h1>
                            </div>
                            <div>
                                <h1 className="caption type-caption">
                                    {playlistResults.description || "No description for this playlist."}
                                </h1>
                            </div>
    
                            <div className="genre-list">
                                <h1 className="artist-link">
                                    {playlistTracks.total} songs, {formatDuration(playlistTracks.items)}
                                </h1>
                            </div>

                            <Link to={playlistResults.external_urls.spotify} style={linkStyles}>
                                <button className = "rate-button" id="loginButton">
                                    Open on Spotify
                                </button>
                            </Link>
                        </div>
                    </div>
    
                    <div className="profile-body" style={{ background: bodyGradient }}>
                        <div className="profile-body-expand">
                            <div className="top-songs top-tabs pb-3 pt-3">
                                <h1
                                    className={`top-tab caption profile-subcaption pb-3 ${
                                        activeTab === 'Overview' ? 'active-profile' : ''
                                    }`}
                                    onClick={() => handleTabClick('Overview')}
                                >
                                    Tracklist
                                </h1>
                            </div>
    
                            {/* Tab Content */}
                            {activeTab === 'Overview' && (
                                <div className="content-overview">
                                    <div className="top-songs pb-5 pt-3">
                                        <PlaylistTracklist
                                            items={playlistTracks.items}
                                            showTracklistTop={true}
                                            alternate={false}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
}

export default PlaylistPage;



  