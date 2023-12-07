import React, { useState, useEffect } from "react";
import { useParams, NavLink, Route, Switch } from 'react-router-dom';
import { Container } from "react-bootstrap";
import axios from "axios"
import UserIcon from '../Assets/Icons/UserProfileIcon.png';
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

function UserPage() {

   
    const { userId } = useParams(); // Get the artistId from the URL
    const [userResults, setUserResults] = useState([]);

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
            setLoading(true);
            
            performSearch()
            

            setLoading(false); // Set loading to false when data is loaded
        }

        fetchData();
    }, [userId]); // Make sure to update the data when artistId changes

    async function performSearch() {

        const userResults = await axios.post("http://localhost:3000/user", {id: userId})
            .then(response => response.data)
            .catch(e=> {
                console.log(e);
                return {}
            })

            if (userResults) {
                setUserResults(userResults);
            } else {
                setUserResults([]);
            }

    }

   

   

    

    



    return (
        <div>
            <div className="page-body">
                {loading ? (
                    <Loading/>
                ) : (
                    <div >
                        <ColorExtractor
                            src={UserIcon}
                            getColors={handleGetColors}
                        />
                        <div className="profile-head" style={{ background: gradientString }}>
                            <div className="column-left">
                                <div className="artist-image-container">
                                    <img src={UserIcon} className="artist-image profile-image mb-3" />
                                </div>
                            </div>
                            <div className="column-right">
                                <div className = "profile-name">
                                    <h1 className="profile-caption">{userResults.username}</h1>
                                </div>
                                <div>
                                    <h1 className="caption  type-caption "> {userResults.accountname} </h1>
                                </div>

                                <div>
                                  
                                    <div>
                                        
                                        <div className="genre-list">
                                     
                                            <a   className="artist-link">
                                                User
                                            </a>
                                      
                                        </div>
                                    </div>
                                   
                                </div>
                            </div>
                            
                        </div>

                        <div className = "profile-body" style ={{background: bodyGradient}}>
                            <div className = "profile-body-expand">

                                <div className = "top-songs top-tabs pb-3 pt-3">
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Overview' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Overview')}>Overview</h1>
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Review' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Review')}>Reviews</h1>
                                    <h1 className={`top-tab caption profile-subcaption pb-3 ${activeTab === 'Stats' ? 'active-profile' : ''}`} 
                                        onClick={() => handleTabClick('Stats')}>Stats</h1>
       
                                </div>




                                     



                                {activeTab === 'Overview' && (
                                    // Content related to Overview tab
                                    <div className="content-overview">
                                        <h1 className = "caption profile-altsubcaption pb-3 pt-3">User content unavailable.</h1>
                                    </div>
                                )}

                                {activeTab === 'Review' && (
                                    // Content related to Overview tab
                                    <div className="content-overview">
                                        <h1 className = "caption profile-altsubcaption pb-3 pt-3">User reviews unavailable.</h1>
                                    </div>
                                )}

                                {activeTab === 'Stats' && (
                                    // Content related to Stats tab
                                    <div className="content-stats">

                                            <div>
                                                <h1 className = "caption profile-altsubcaption pb-3 pt-3">User stats not found.</h1>
                                            </div>
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

export default UserPage;



  