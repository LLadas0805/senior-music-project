import React, { useState, useEffect } from "react";
import { useParams, NavLink, Route, Switch } from 'react-router-dom';
import { Container } from "react-bootstrap";
import UserIcon from '../Assets/Icons/UserIcon.png';
import './profile.css'
import './home.css'
import { ColorExtractor  } from 'react-color-extractor';
import chroma from 'chroma-js';
import CustomCardResult from "./CustomCardResult.jsx";
import CustomTracklist from "./CustomTracklist.jsx"
import Genres from "./genres.json";
import Loading from "./loading.jsx"




const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function ArtistPage() {
    const [artistResults, setArtistResults] = useState({});
    const [artistAlbums, setArtistAlbums] = useState({});
    const [artistTracks, setArtistTracks] = useState({});
    const [userStats, setUserStats] = useState([]);
    const [appearsOn, setAppeared] = useState({})
    const [accessToken, setAccessToken] = useState("");
    const { artistId } = useParams(); // Get the artistId from the URL
    const spotifyEndpoints = `https://api.spotify.com/v1/artists/${artistId}`;
    const [loading, setLoading] = useState(true);
    const [extractedColors, setExtractedColors] = useState([]);
    const [relatedArtists, setRelatedArtists] = useState({});
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
            setLoading(true);
            const token = await fetchAccessToken();
            setAccessToken(token);
           
            // Fetch artist data
            const artistData = await performSearch(token, spotifyEndpoints);
            
            setArtistResults(artistData);
            const albumData = await performSearch(token, spotifyEndpoints + '/albums?include_groups=album,single,compilation&limit=42');
            setArtistAlbums(albumData)
            const trackData = await performSearch(token, spotifyEndpoints + '/top-tracks?market=US')
            setArtistTracks(trackData)


            const appearedData = await performSearch(token, spotifyEndpoints + '/albums?include_groups=appears_on&limit=42');
            setAppeared(appearedData);

            const relatedData = await performSearch(token, spotifyEndpoints + '/related-artists');
            setRelatedArtists(relatedData);
            console.log(relatedData)

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
        <div>
            <div className="page-body">
                {loading ? (
                    <Loading/>
                ) : (
                    <div >
                        <ColorExtractor
                            src={artistResults.images?.[0]?.url || UserIcon}
                            getColors={handleGetColors}
                        />
                        <div className="profile-head" style={{ background: gradientString }}>
                            <div className="column-left">
                                <div className="artist-image-container">
                                    <img src={artistResults.images?.[0]?.url || UserIcon} className="artist-image profile-image mb-3" />
                                </div>
                            </div>
                            <div className="column-right">
                                <div className = "profile-name">
                                    <h1 className="profile-caption">{artistResults.name}</h1>
                                </div>
                                <div>
                                    <h1 className="caption  type-caption ">{artistResults.type.charAt(0).toUpperCase() 
                                    + artistResults.type.slice(1)}</h1>
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
                                    <p className="genre-link">No genres found for this artist.</p>
                                    )}
                                </div>
                            </div>
                            
                        </div>

                        <div className = "profile-body" style ={{background: bodyGradient}}>
                            <div className = "profile-body-expand">

                                <div className = "top-songs top-tabs pb-3 pt-3">
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Overview' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Overview')}>Overview</h1>
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Recommended' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Recommended')}>Recommended</h1>
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Stats' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Stats')}>Stats</h1>
       
                                </div>




                                     



                                {activeTab === 'Overview' && (
                                    // Content related to Overview tab
                                    <div className="content-overview">
                                        <div className = "top-songs pb-5 pt-3">
                                            <h1 className = "caption profile-altsubcaption pb-3">Popular</h1>
                                            <CustomTracklist items = {artistTracks.tracks} showTracklistTop = {false}/>
                                        

                                        </div>

                                        <div className = "top-songs pb-3">
                                            <h1 className = "caption profile-altsubcaption pb-3">Discography</h1>
                                            <CustomCardResult items = {artistAlbums.items} subtitleType="album-artist" singleRow = {true} />
                                            
                                        </div>


                                        <div className = "top-songs pb-3">
                                            <h1 className = "caption profile-altsubcaption pb-3">Appears on</h1>
                                            <CustomCardResult items = {appearsOn.items} subtitleType="album-artist" singleRow = {true} />
                                        </div>  
                                    </div>
                                )}

                                {activeTab === 'Recommended' && (
                                    // Content related to Recommended tab
                                    <div className="content-recommended">
                                        <div className = "top-songs pb-3 pt-3">
                                            <h1 className = "caption profile-altsubcaption pb-3">Fans also like</h1>
                                            <CustomCardResult items = {relatedArtists.artists} subtitleType="artist"  />
                                            
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Stats' && (
                                    // Content related to Stats tab
                                    <div className="content-stats">
                                        {userStats.length > 0 ? (
                                         
                                            <div>
                                                {/* Render user stats here */}
                                            </div>
                                        ) : (
                                            // If userStats is empty, display a message
                                            <div>
                                                <h1 className = "caption profile-altsubcaption pb-3 pt-3">User stats not found for this artist.</h1>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                        </div>

                    </div>
                       
                    

                )}
            </div>
        </div>
    );
}

export default ArtistPage;



  