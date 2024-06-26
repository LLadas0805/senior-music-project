import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'
import axios from "axios"
import {  InputGroup, FormControl, Button, Row } from "react-bootstrap";
import SearchFilter from "./search-filter.jsx";
import debounce from 'lodash/debounce';
import CustomCardResult from "./CustomCardResult.jsx";
import CustomTracklist from "./CustomTracklist.jsx"
import Genres from "./genres.json";
import Loading from "./loading.jsx"


const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function Search() {
    const location = useLocation();

    const [searchInput, setSearchInput] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [searchType, setSearchType] = useState("all");
    const [albums, setAlbums] = useState([]);
    const [songs, setSongs] = useState([]);
    const [artists, setArtists] = useState([]);
    const [searching, setSearching] = useState(false);
    const [users, setUsers] = useState([])
    const [genres, setGenres] = useState([]);
 
    const [playlists, setPlaylists] = useState([]);
    const [features, setFeatures] = useState([]);
    

    const types = [
        { label: "All", value: "all" },
        { label: "Artists", value: "artist" },
        { label: "Albums", value: "album" },
        { label: "Songs", value: "track" },
        { label: "Genres & Moods", value: "genre" },
        { label: "Users", value: "user"},
       
    ];

    useEffect(() => {
        
        fetchAccessToken();
                
      }, []);

    async function fetchAccessToken() {
        
        // API Access Token
        var authParameters = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        }
        const data = await fetch('https://accounts.spotify.com/api/token', authParameters)
            .then(result => result.json());
        setAccessToken(data.access_token);
        featureSearch(data.access_token);
    }

    useEffect(() => {
        // Perform the delayed search when searchInput changes
        const delaySearch = debounce(() => {
            performSearch();
            
        }, 700);

        if (searchInput.trim() !== "") {
            setSearching(true);
            delaySearch();
        } else {
            setAlbums([]);
            setArtists([]);
            setSongs([]);
            setSearching(false);
        }

        // Cleanup the delayed search if the component unmounts or the input changes
        return () => {
            delaySearch.cancel();
        };
    }, [searchInput]);

    
    async function featureSearch(accessToken) {
        var searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }
        
        const featuredResults = await fetch(`https://api.spotify.com/v1/browse/featured-playlists`, searchParameters)
            .then(response => response.json())
            .catch(error => {
                console.error('Error searching:', error);
                return {};
            });
        
        
        console.log({featuredResults})

        if (featuredResults.playlists) {
            
            setFeatures(featuredResults.playlists.items);
        } else {
            setFeatures([]);
        }
        
    }

    // Function to find the closest match for multiple genres
    function findClosestGenres(input, genres) {
        const inputLength = input.length;
        const slicedGenres = genres.map(genre => genre.slice(0, inputLength).toLowerCase());
    
        const matches = [];
        slicedGenres.forEach((slicedGenre, index) => {
        if (slicedGenre === input.toLowerCase()) {
            matches.push(genres[index]);
        }
        });
    
        return matches.length > 0 ? matches : [];
    }
    
    async function performSearch() {
        console.log("Searching for " + searchInput);
        console.log("Searching for " + searchInput);

        if (!searchInput || searchInput.trim() === "") {
            
            setAlbums([]);
            setSongs([]);
            setArtists([]);
            setUsers([]);
            setSearching(false);
            return;
        }

        let searchUrl = `https://api.spotify.com/v1/search?q=${searchInput}&type=artist,album,track`;
        let browsingUrl = `https://api.spotify.com/v1/search?q=genre%3A${searchInput}&type=track`;
        let playlistUrl = `https://api.spotify.com/v1/browse/categories/${searchInput}/playlists`;

        // Get request using search to get the Artist ID
        var searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }

        // All of these results below are from fetches to spotify url or axios gets and posts to backend
        // Stores all of these as state variables to use in the rendered frontend

        const searchResults = await fetch(searchUrl, searchParameters)
            .then(response => response.json())
            .catch(error => {
                console.error('Error searching:', error);
                return {};
            });
            
        const userResults = await axios.post("http://localhost:3000/search", {user: searchInput})
            .then(response => response.data)
            .catch(e=> {
                console.log(e);
                return {}
            })

        const trendResults = await fetch(browsingUrl, searchParameters)
            .then(response => response.json())
            .catch(error => {
                console.error('Error searching:', error);
                return {};
            });

        const playlistResults = await fetch(playlistUrl, searchParameters)
            .then(response => response.json())
            .catch(error => {
                console.error('Error searching:', error);
                return {};
            });
       
        console.log({trendResults});
        console.log({userResults});
        console.log({searchResults});
    
        // Find the closest genre to the user input
        const closestGenre = findClosestGenres(searchInput.toLowerCase(), Genres.genres);
        console.log("Closest genre:", closestGenre);
        
        // Extract and set the results for each type
        if (searchResults.artists) {
            setArtists((searchResults.artists.items).filter(item => item !== null));
  
        } else {
            setArtists([]);
        }

        if (searchResults.albums) {
            setAlbums((searchResults.albums.items).filter(item => item !== null));
        } else {
            setAlbums([]);
        }

        if (searchResults.tracks) {
            setSongs((searchResults.tracks.items).filter(item => item !== null));
        } else {
            setSongs([]);
        }

        if (userResults) {
            setUsers(userResults);
        } else {
            setUsers([]);
        }

        if(closestGenre) {
            setGenres(closestGenre);
        } else {
            setGenres([]);
        }

        if (playlistResults.playlists) {
            console.log(playlistResults.playlists.items);
            setPlaylists((playlistResults.playlists.items).filter(item => item !== null));
        } else {
            setPlaylists([]);
        }

        setSearching(false);
    
    }

    return (
        <div className="homepage">
            <div className="pt-4 pb-3 search-bar">
                <InputGroup className="mb-3  form">
                    <FormControl
                        type="text"
                        id="searchresult"
                        className="search-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search for albums, artists, users etc."
                        style={{ backgroundColor: 'transparent', outline: 'none', border: 'none' }}
                    />
                    <Button
                        className="search-button"
                        onClick={() => setSearchInput("")}
                        style={{ display: searchInput ? 'block' : 'none', backgroundColor: 'transparent' }}
                    >
                        X
                    </Button>
                </InputGroup>
                <SearchFilter searchType={searchType} setSearchType={setSearchType} types={types} />
            </div>
            <div className="search-results">
            {searching ? (
                <div className="caption-div">
                    <Loading/>
                </div>
            ) : (
                <>
                    {searchInput ? (
                        <Row className="search-rows">
                            
                            {searchType === "all" && (
                                <>
                                   
                                   {artists.length > 0 && (
                                        <>
                                            <div className="caption-div">
                                                <p className="caption">Top Artists</p>
                                            </div>
                                            <CustomCardResult items={artists.slice(0, 6)} subtitleType="artist" singleRow={true} />
                                        </>
                                    )}

                                    {albums.length > 0 && (
                                        <>
                                            <div className="caption-div">
                                                <p className="caption">Top Albums</p>
                                            </div>
                                            <CustomCardResult items={albums.slice(0, 6)} subtitleType="album" singleRow={true} />
                                        </>
                                    )}

                                    {songs.length > 0 && (
                                        <>
                                            <div className="caption-div">
                                                <p className="caption">Top Songs</p>
                                            </div>
                                            <CustomCardResult items={songs.slice(0, 6)} subtitleType="song" singleRow={true} />
                                        </>
                                    )}

                                    {users.length > 0 && (
                                        <>
                                            <div className="caption-div">
                                                <p className="caption">Top Users</p>
                                            </div>
                                            <CustomCardResult items={users.slice(0, 6)} subtitleType="user" singleRow={true} />
                                        </>
                                    )}

                                    {genres.length > 0 && (
                                        <>
                                            <div className="caption-div">
                                                <p className="caption">Genres & Moods</p>
                                            </div>
                                            <CustomCardResult items={genres.slice(0, 6)} subtitleType="genre" singleRow={true} />
                                        </>
                                    )}
                                </>
                            )}
                            {searchType === "artist" && 
                            <><div className="caption-div">
                                            <p className="caption">Artist results for "{searchInput}"</p>
                            </div><CustomCardResult items={artists} subtitleType="artist" /></>}

                            {searchType === "album" &&
                            <><div className="caption-div">
                            <p className="caption">Album results for "{searchInput}"</p>
                            </div> <CustomCardResult items={albums} subtitleType="album" /></>}

                            {searchType === "track" && 
                            <><div className="caption-div">
                            <p className="caption">Song results for "{searchInput}"</p>
                            </div> <CustomTracklist items={songs} /></>}
                            
                            {searchType === "user" && 
                            <><div className="caption-div">
                            <p className="caption">User results for "{searchInput}"</p>
                            </div><CustomCardResult items={users} subtitleType="user" /></>}

                            {searchType === "genre" && 
                            <><div className="caption-div">
                            <p className="caption">Genre results for "{searchInput}"</p>
                            </div><CustomCardResult items={genres} subtitleType="genre" />
                            <div className="caption-div">
                            <p className="caption">Mood results for "{searchInput}"</p>
                            </div>
                            <CustomCardResult items={playlists} subtitleType="playlist" /></>}
                        </Row>
                    ) : (
                        <Row className="search-rows">
                            <div className="caption-div">
                                <p className="caption">Browse Trending Music</p>
                            </div>
                            <CustomCardResult items={features} subtitleType="playlist" />
                            <div className="caption-div">
                                <p className="caption">Browse Genres</p>
                            </div>
                            <CustomCardResult items={Genres.genres} subtitleType="genre" />
                        </Row>
                    )}
                </>
            )}

            </div>
        </div>
    );
}

export default Search;
