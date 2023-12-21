import React, { useState, useEffect} from "react";
import { useParams, Link  } from 'react-router-dom';
import UserIcon from '../Assets/Icons/UserIcon.png';
import './profile.css'
import '../home-page/home.css'
import { ColorExtractor  } from 'react-color-extractor';
import CustomTracklist from "../card-lists/CustomTracklist.jsx"
import ReviewResults from "../reviews/review-results.jsx"
import GenreIcon from '../Assets/Icons/GenreIcon.png'
import Loading from "../misc-page/loading.jsx"
import Review from '../reviews/review.jsx'

import NotFound from "../misc-page/not-found.jsx"
import axios from "axios"
import textFit from "textfit"



const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";



function AlbumPage() {

    

    const [albumResults, setAlbumResults] = useState({});
    const [albumTracks, setAlbumTracks] = useState({});
    const [reviews, setReviews] = useState([]);
    const [accessToken, setAccessToken] = useState("");
    const { albumId } = useParams(); // Get the albumId from the URL
    const spotifyEndpoints = `https://api.spotify.com/v1/albums/${albumId}`;
    const [loading, setLoading] = useState(true);
    const [extractedColors, setExtractedColors] = useState([]);
    const [userData, setUserData] = useState([]);
  

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
           
            const token = await fetchAccessToken();
            setAccessToken(token);
           
           

            const albumData = await performSearch(token, spotifyEndpoints);

          
            setAlbumResults(albumData);
            console.log(albumData);

            
            setAlbumTracks(albumData.tracks)
            console.log(albumData.tracks);

            try {
        
                await axios.post("http://localhost:3000/album-reviews", {
                    albumId
                })
                .then(response => {
                 
                    setReviews(response.data)
                    console.log('REVIEWS: ', reviews)
                })
                
          
            } catch(e) {
                console.log(e)
            }


            
    

            setLoading(false); 
        }

        axios.get("http://localhost:3000/session")
        .then(response => {
         
          setUserData(response.data); 
        })

       
        
        fetchData();
        textFit(document.getElementsByClassName('profile-name'));
         
       
       
        

    }, [albumId]); 

   

 
      
    function formatDuration(albumResults) {

        console.log('formatDuration', albumResults)
        let totalDuration = 0;
    
      
        albumResults.tracks.items.map(track => {
            if (track.duration_ms) {
                totalDuration += track.duration_ms;
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

        return [];
    }

    const linkStyles = {
        textDecoration: 'none', // Remove underline
        color: 'inherit', // Inherit the color from the parent
      };

      return (
        <div>
            <div className="page-body">
                {loading ? (
                    <Loading />
                ) : albumResults.length === 0 ? (
                    <NotFound />
                ) : (
                    <div>
                        <ColorExtractor
                            src={albumResults.images?.[0]?.url || GenreIcon}
                            getColors={handleGetColors}
                        />
                        <div className="profile-head" style={{ background: gradientString }}>
                            <div className="column-left">
                                <div className="artist-image-container">
                                    <img
                                        src={albumResults.images?.[0]?.url || UserIcon}
                                        className="card-image profile-image mb-3"
                                    />
                                </div>
                            </div>
                            <div className="column-right">
                                <div className="profile-name" id="profile-name">
                                    <h1 className="profile-caption" id="profile-caption">
                                        {albumResults.name}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="caption type-caption">
                                        {albumResults.album_type.charAt(0).toUpperCase() +
                                            albumResults.album_type.slice(1)}
                                    </h1>
                                </div>
    
                                <div>
                                    <div>
                                        <div className="genre-list">
                                            <h1 className="artist-link">
                                                {albumResults.artists.map((artist, index) => (
                                                    <React.Fragment key={index}>
                                                        {index !== 0 && ", "}
                                                        <span>
                                                            <Link
                                                                to={`/artist/${artist.id}`}
                                                                style={linkStyles}
                                                            >
                                                                {artist.name}
                                                            </Link>
                                                        </span>
                                                    </React.Fragment>
                                                ))}
                                                • {new Date(albumResults.release_date).getFullYear()} • {albumResults.total_tracks} songs, {formatDuration(albumResults)}
                                            </h1>
                                        </div>
                                        <Link to={albumResults.external_urls.spotify} style={linkStyles}>
                                            <button className = "rate-button" id="loginButton">
                                                Open on Spotify
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        <div className="profile-body" style={{ background: bodyGradient }}>
                            <div className="profile-body-expand">
                                <div className="top-songs top-tabs pb-3 pt-3">
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Overview' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Overview')}>Tracklist</h1>
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Review' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Review')}>Reviews</h1>
                                    
                                </div>
    
                                {activeTab === 'Overview' && (
                                    // Content related to Overview tab
                                    <div className="content-overview">
                                        <div className="top-songs pb-5 pt-3">
                                            <CustomTracklist
                                                items={albumTracks.items}
                                                showTracklistTop={true}
                                                alternate={true}
                                                showDiscNumber={true}
                                            />
                                        </div>
                                    </div>
                                )}
    
                                {activeTab === 'Recommended' && (
                                    // Content related to Recommended tab
                                    <div className="content-recommended">
                                        <div className="top-songs pb-3 pt-3">
                                            <h1 className="caption profile-altsubcaption pb-3">
                                                Fans also like
                                            </h1>
                                        </div>
                                    </div>
                                )}
    
                          
    
                                {activeTab === 'Review' && (
                                    // Content related to Review tab
                                    <div>
                                        <div className="content-review">
                                            <h1 className="caption profile-altsubcaption pb-3">
                                                Rate this album
                                            </h1>
                                        </div>
                                        {userData._id ? (
                                            <Review albumId={albumId} />
                                        ) : (
                                            <p className="artist-link">
                                                Want to rate this album?{' '}
                                                <Link to={'/signup'} >
                                                    <a>Create an account</a>
                                                    
                                                </Link>{' '}
                                                or{' '}
                                                <Link to={'/login'}>
                                                    <a>Log in</a>
                                                </Link>
                                            </p>
                                        )}
    
                                        
                                        {reviews.length > 0 ? (
                                            <div className="content-review">
                                                <h1 className="caption profile-altsubcaption pb-3">
                                                    Album ratings
                                                </h1>
                                                <ReviewResults reviews={reviews} />
                                            
                                            </div>
                                            
                                        ) : (
                                            <p className="caption">
                                                No ratings available for this album
                                            </p>
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

export default AlbumPage;



  