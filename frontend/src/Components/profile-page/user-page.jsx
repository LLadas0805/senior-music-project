import React, { useState, useEffect } from "react";
import { useParams , Link} from 'react-router-dom';
import axios from "axios"
import UserIcon from '../Assets/Icons/UserProfileIcon.png';
import './profile.css'
import '../home-page/home.css'
import { ColorExtractor  } from 'react-color-extractor';
import CustomCardResult from "../card-lists/CustomCardResult.jsx";
import CustomTracklist from "../card-lists/CustomTracklist.jsx"
import Loading from "../misc-page/loading.jsx"
import NotFound from "../misc-page/not-found.jsx"
import UserReviewResults from "../reviews/user-review-results.jsx"
import PlaylistTracklist from "../card-lists/PlaylistTracklist.jsx";





const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function UserPage() {

   
    const { userId } = useParams(); // Get the artistId from the URL
    const [userResults, setUserResults] = useState([]);

    const [token, setToken] = useState(null)

    const [loading, setLoading] = useState(true);
    const [extractedColors, setExtractedColors] = useState([]);
    const [userAuth, setUserAuth] = useState(false)
    const [gradientString, setGradientString] = useState('');
    const [bodyGradient, setBodyGradient] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const [activeStatTab, setActiveStatTab] = useState('all-time')
    const [followState, setFollowState] = useState('');
    const [topArtistsMonth, setTopArtistsMonth] = useState([]);
    const [topArtistsTotal, setTopArtistsTotal] = useState([]);
    const [topTracksMonth, setTopTracksMonth] = useState([]);
    const [topTracksTotal, setTopTracksTotal] = useState([]);
    const [topPlaylists, setTopPlaylists] = useState([])
    const [listenHistory, setListenHistory] = useState([]);
    const [userSession, setUserSession] = useState([])
    const [spotifyUserPage, setSpotifyUserPage] = useState([]);
    const [reccomended, setReccomended] = useState([]);
    const [followingVal, setFollowingVal] = useState([]);
    const [followingResults, setFollowingResults] = useState([]);
    const [followersVal, setFollowersVal] = useState([]);
    const [followerResults, setFollowerResults] = useState([]);

    const [userReviews, setUserReviews] = useState([]);

    // Example function to refresh the access token using the refresh token
    async function refreshAccessToken(refreshToken) {
        const clientId = CLIENT_ID;
        const clientSecret = CLIENT_SECRET;
        const base64Encoded = btoa(`${clientId}:${clientSecret}`).toString('base64');
    
        const url = 'https://accounts.spotify.com/api/token';
        const body = new URLSearchParams();
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', refreshToken);
    
        try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${base64Encoded}`
            },
            body: body
        });
    
        if (response.ok) {
            const data = await response.json();
            const newAccessToken = data.access_token;
            // Use the new access token for Spotify API requests
            return newAccessToken;
        } else {
            // Handle error when refreshing token
            console.error('Error refreshing access token:', response.statusText);
            return null;
        }
        } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
        }
    }
  

    const handleSpotifyLogin = () => {
        console.log('handleSpotifyLogin function called.');
        const authEndpoint = 'https://accounts.spotify.com/authorize';
        const clientId = '5d8c84c59ac8435e91aa1c9d5d2e9706';
        const redirectUri = 'http://localhost:3000/';
        const scopes = ['user-top-read', 'user-read-recently-played'];
    
        const queryParams = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scopes.join(' '),
            response_type: 'code',
            show_dialog: 'true',
            access_type: 'offline'
        });
    
        const authUrl = `${authEndpoint}?${queryParams.toString()}`;
        
        window.location.href = authUrl;
    };
    
    const handleFollow = async () => {
        console.log('hello follow');
        try {
            const userResults = await axios.post("http://localhost:3000/change-follower", {id: userId, type: 'user'});
            console.log('userResults: ', userResults.data);
    
            if (userResults.data === "Follow" || userResults.data === "Unfollow") {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleSpotifyLogout = async () => {
       
        try {
            const logoutResults = await axios.get("http://localhost:3000/spotify-logout");
          
    
            if (logoutResults.data === "logout") {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    }
   

    // Function to handle tab click and set the active tab
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleStatClick = (tabName) => {
        setActiveStatTab(tabName);
    }

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
        
        performSearch();
       
        

       
    }, [userId, token]);

    useEffect(() => {
        
        
    }, [followingVal]);

    async function performSearch() {
        try {
            setLoading(true);
            const [userResults, userAuth, userToken, userReviews, followState] = await Promise.all([
                axios.post("http://localhost:3000/user", { id: userId }),
                axios.post("http://localhost:3000/user-authenticate", { id: userId }),
                axios.post("http://localhost:3000/user-token", { id: userId }),
                axios.post("http://localhost:3000/user-reviews", { id: userId }),
                axios.post("http://localhost:3000/follow-status", { id: userId, type: 'user' })
            ]);
    
            setUserResults(userResults.data);
            setUserAuth(userAuth.data);
            const refreshedAccessToken = await refreshAccessToken(userToken.data);
            setToken(refreshedAccessToken);
            setUserReviews(userReviews.data);
            setFollowState(followState.data);
    
            const getTopStats = async (type, timeRange) => {
                try {
                    const token = refreshedAccessToken;
                    const response = await fetch(`https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}`, {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        return await response.json();
                    } else {
                        console.error('Error getting top artists');
                        return null;
                    }
                } catch (error) {
                    console.error('Error getting top artists:', error);
                    return null;
                }
            };
    
            const getUserSpotifyData = async (endpoint) => {
                try {
                    const token = refreshedAccessToken;
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        return await response.json();
                    } else {
                        console.error('Error getting Spotify data');
                        return null;
                    }
                } catch (error) {
                    console.error('Error getting Spotify data:', error);
                    return null;
                }
            };
    
            const [spotifyUserPageData, topArtistsMonthData, topTracksMonthData, topArtistsTotalData, topTracksTotalData, topPlaylistsData, listenHistoryData] = await Promise.all([
                getUserSpotifyData(`https://api.spotify.com/v1/me/`),
                getTopStats("artists", "short_term"),
                getTopStats("tracks", "short_term"),
                getTopStats("artists", "long_term"),
                getTopStats("tracks", "long_term"),
                getUserSpotifyData(`https://api.spotify.com/v1/me/playlists`),
                getUserSpotifyData(`https://api.spotify.com/v1/me/player/recently-played`)
            ]);
    
            setSpotifyUserPage(spotifyUserPageData);
            setTopArtistsMonth(topArtistsMonthData);
            setTopTracksMonth(topTracksMonthData);
            setTopArtistsTotal(topArtistsTotalData);
            setTopTracksTotal(topTracksTotalData);
            setTopPlaylists(topPlaylistsData);
            setListenHistory(listenHistoryData);
    
            if (userToken.data) {
                const [topArtistsIds] = await getTopStats("artists", "long_term");
                const extractedArtistIds = extractIds(topArtistsIds?.items?.slice(0, 4) || []);
                const seedArtists = `seed_artists=${extractedArtistIds.join(',')}`;
                const recommendationsURL = `https://api.spotify.com/v1/recommendations?${seedArtists}`;
                setReccomended(await getUserSpotifyData(recommendationsURL));
            } else {
                setReccomended([]);
            }
    
            setLoading(false);
        } catch (error) {
            console.error('Error performing search:', error);
            setLoading(false);
        }
    }
    

    return (
        <div className="page-body">
            {loading ? (
                <Loading />
            ) : userResults.length === 0 ? (
                <NotFound />
            ) : (
                <div>
                    {/* Profile Header */}
                    <ColorExtractor src={UserIcon} getColors={handleGetColors} />
                    <div className="profile-head" style={{ background: gradientString }}>
                        {/* Left Column */}
                        <div className="column-left">
                            <div className="artist-image-container">
                                <img src={UserIcon} className="artist-image profile-image mb-3" />
                            </div>
                        </div>
    
                        {/* Right Column */}
                        <div className="column-right">
                            <div className="profile-name">
                                <h1 className="profile-caption">{userResults.username}</h1>
                            </div>
                            <div>
                                <h1 className="caption type-caption"> {userResults.accountname} </h1>
                            </div>
    
                            <div className="genre-list">
                            <p className="artist-link">
                                User • {followersVal.followerIds ? followersVal.followerIds.length : 0} Followers • {followingVal && followingVal.followingList ? followingVal.followingList.length : 0} Following
                            </p>

                            </div>
    
                            {/* Conditionally render Spotify authorization button */}
                            {userAuth === true && !token && (
                                <button className = "rate-button" id="loginButton" onClick={handleSpotifyLogin}>
                                    Authorize Spotify
                                </button>
                            )}

                            {userAuth === true && token && (
                                <button className = "rate-button" id="loginButton" onClick={handleSpotifyLogout}>
                                    Delink Spotify
                                </button>
                            )}

                            {userAuth !== true && (userSession._id) && (

                               
                                    <button className = "rate-button" id="loginButton" onClick={handleFollow}>
                                        {followState}
                                    </button>

                                 
                            
                                

                                
                            )}

                            {token && (
                                <Link to={spotifyUserPage.external_urls.spotify} >
                                    <button className = "rate-button" id="loginButton" >
                                        Open on Spotify
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
    
                    {/* Profile Body */}
                    <div className="profile-body" style={{ background: bodyGradient }}>
                        <div className="profile-body-expand">
                            {/* Tabs */}
                            <div className="top-songs top-tabs pb-3 pt-3">
                                <h1
                                    className={`top-tab caption profile-subcaption pb-3 ${
                                        activeTab === 'Overview' ? 'active-profile' : ''
                                    }`}
                                    onClick={() => handleTabClick('Overview')}
                                >
                                    Overview
                                </h1>
                                <h1
                                    className={`top-tab caption profile-subcaption pb-3 ${
                                        activeTab === 'Following' ? 'active-profile' : ''
                                    }`}
                                    onClick={() => handleTabClick('Following')}
                                >
                                    Following
                                </h1>

                                <h1
                                    className={`top-tab caption profile-subcaption pb-3 ${
                                        activeTab === 'Followers' ? 'active-profile' : ''
                                    }`}
                                    onClick={() => handleTabClick('Followers')}
                                >
                                    Followers
                                </h1>
                                <h1
                                    className={`top-tab caption profile-subcaption pb-3 ${
                                        activeTab === 'Review' ? 'active-profile' : ''
                                    }`}
                                    onClick={() => handleTabClick('Review')}
                                >
                                    Reviews
                                </h1>
                                <h1
                                    className={`top-tab caption profile-subcaption pb-3 ${
                                        activeTab === 'Stats' ? 'active-profile' : ''
                                    }`}
                                    onClick={() => handleTabClick('Stats')}
                                >
                                    Stats
                                </h1>

                               
                            </div>
    
                            {/* Tab Content */}
                            {activeTab === 'Overview' && (
                                // Content related to Overview tab
                                <div className="content-overview">



                                    <div>
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">Milestones</h1>
                                        <ul>
                                            <li className = "artist-link">{followingVal.length >= 5 ? `Completed: ` : `Incomplete: `}Follow 5 or more users on this website</li>
                                            <li  className = "artist-link">{followersVal.length >= 5 ? `Completed: ` : `Incomplete: `}Have 5 or more users follow you on this website</li>
                                            <li className = "artist-link">{userReviews.length >= 5 ? `Completed: ` : `Incomplete: `}Review 5 or more albums</li>
                                        </ul>
                                    </div>

                                    
                                    
                                        
                                    {/* Listening Activity */}
                                    {listenHistory && listenHistory.items && listenHistory.items.length > 0 && (
                                        <div>
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">Listening activity</h1>
                                            <PlaylistTracklist items={listenHistory.items} />
                                        </div>
                                    )}
                                    {(!listenHistory || !listenHistory.items || listenHistory.items.length === 0) && (
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">No listening activity available</h1>
                                    )}
                                
                                    {/* User Playlists */}
                                    {topPlaylists && topPlaylists.items && topPlaylists.items.length > 0 && (
                                        <div>
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">User playlists</h1>
                                            <CustomCardResult items={topPlaylists.items} subtitleType={"playlist"} />
                                        </div>
                                    )}
                                    {(!topPlaylists || !topPlaylists.items || topPlaylists.items.length === 0) && (
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">No user playlists available</h1>
                                    )}

                                    {/* User Playlists */}
                                    {reccomended && reccomended.tracks && reccomended.tracks.length > 0 && (
                                        <div>
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">User reccomended</h1>
                                            <CustomTracklist items={reccomended.tracks}/>
                                        </div>
                                    )}
                                    {(!reccomended || !reccomended.tracks || reccomended.tracks.length === 0) && (
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">No user recommendations available</h1>
                                    )}

                                    <div className = 'mb-3'>
                                    </div>
                                   
                                </div>
                            )}
    
                            {activeTab === 'Review' && (
                                // Content related to Reviews tab
                                <div className="content-overview">
                                    {userReviews.length === 0 ? (
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">No user reviews available.</h1>
                                    ) : (
                                        <><div>
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">User reviews</h1>
                                        </div><UserReviewResults reviews={userReviews} /></>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Following' && (
                                // Content related to Reviews tab
                                <div className="content-overview">
                                    {!followingVal.followingList ? (
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">No following stats available.</h1>
                                    ) : (
                                        <><div>
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">Following</h1>
                                        </div><CustomCardResult items={followingResults} subtitleType={"user"} /></>
                                    )}
                                </div>
                            )}


                            {activeTab === 'Followers' && (
                                // Content related to Reviews tab
                                <div className="content-overview">
                                    {followersVal.length === 0 ? (
                                        <h1 className="caption profile-altsubcaption pb-3 pt-3">No followers available.</h1>
                                    ) : (
                                        <><div>
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">Followers</h1>
                                        </div> <CustomCardResult items={followerResults} subtitleType={"user"}/>  </>
                                    )}
                                </div>
                            )}


                            
    
                            {activeTab === 'Stats' && (
                            // Content related to Stats tab
                            <div className="content-stats">
                                {/* Stat Tabs */}
                                <div className="top-songs top-tabs pb-3 pt-3">
                                    <h1
                                        className={`top-tab caption profile-subcaption pb-3 ${
                                            activeStatTab === 'all-time' ? 'active-profile' : ''
                                        }`}
                                        onClick={() => handleStatClick('all-time')}
                                    >
                                        All time
                                    </h1>
                                    <h1
                                        className={`top-tab caption profile-subcaption pb-3 ${
                                            activeStatTab === 'past-month' ? 'active-profile' : ''
                                        }`}
                                        onClick={() => handleStatClick('past-month')}
                                    >
                                        Past month
                                    </h1>
                                </div>

                                {/* Top Artists and Tracks */}
                    
                                {activeStatTab === 'all-time' && (
                                    <div>
                                        
                                        {topArtistsTotal && topArtistsTotal.items.length > 0 ? (
                                            <><h1 className="caption profile-altsubcaption pb-3 pt-3">Top artists</h1>
                                            <CustomCardResult items={topArtistsTotal.items} subtitleType={"artist"} /></>
                                        ) : (
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">No data available for all-time top artists.</h1>
                                        )}

                                        <div>
                                            
                                            {topTracksTotal && topTracksTotal.items.length > 0 ? (
                                                <><h1 className="caption profile-altsubcaption pb-3 pt-3">Top tracks</h1>
                                                <CustomTracklist items={topTracksTotal.items} subtitleType={"song"} /></>
                                            ) : (
                                                <h1 className="caption profile-altsubcaption pb-3 pt-3">No data available for all-time top tracks.</h1>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeStatTab === 'past-month' && (
                                    <div>
                                        
                                        {topArtistsMonth && topArtistsMonth.items.length > 0 ? (
                                            <><h1 className="caption profile-altsubcaption pb-3 pt-3">Top artists</h1>
                                            <CustomCardResult items={topArtistsMonth.items} subtitleType={"artist"} /></>
                                        ) : (
                                            <h1 className="caption profile-altsubcaption pb-3 pt-3">No data available for past-month top artists.</h1>
                                        )}

                                        <div>
                                            
                                            {topTracksMonth && topTracksMonth.items.length > 0 ? (
                                                <><h1 className="caption profile-altsubcaption pb-3 pt-3">Top tracks</h1>
                                                <CustomTracklist items={topTracksMonth.items} subtitleType={"song"} /></>
                                                
                                            ) : (
                                                <h1 className="caption profile-altsubcaption pb-3 pt-3">No data available for past-month top tracks.</h1>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
}

export default UserPage;



  