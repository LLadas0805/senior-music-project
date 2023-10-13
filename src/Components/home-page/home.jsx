import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'
import { Container, InputGroup, FormControl, Button, Row, Card } from "react-bootstrap";
import SearchFilter from "./search-filter";
import debounce from 'lodash/debounce';
import CustomCardResult from "./CustomCardResult.jsx";
import CustomTracklist from "./CustomTracklist.jsx"

const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";





function Home() {
    const location = useLocation();

    const [searchInput, setSearchInput] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [searchType, setSearchType] = useState("all");
    const [albums, setAlbums] = useState([]);
    const [songs, setSongs] = useState([]);
    const [artists, setArtists] = useState([]);
    const [searching, setSearching] = useState(false);

    const types = [
        { label: "All", value: "all" },
        { label: "Artists", value: "artist" },
        { label: "Albums", value: "album" },
        { label: "Songs", value: "track" },
       
    ];

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    useEffect(() => {
        // Fetch access token once during component initialization
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

    async function performSearch() {
        console.log("Searching for " + searchInput);
        console.log("Searching for " + searchInput);

        if (!searchInput || searchInput.trim() === "") {
            
            setAlbums([]);
            setSongs([]);
            setArtists([]);
            setSearching(false);
            return;
        }

        let searchUrl = `https://api.spotify.com/v1/search?q=${searchInput}&type=artist,album,track`;

       
            

       

        // Get request using search to get the Artist ID
        var searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }

        const searchResults = await fetch(searchUrl, searchParameters)
            .then(response => response.json())
            .catch(error => {
                console.error('Error searching:', error);
                return {};
            });

        console.log({searchResults})
        
        // Extract and set the results for each type
        if (searchResults.artists) {
            setArtists(searchResults.artists.items);
  
        } else {
            setArtists([]);
        }

        if (searchResults.albums) {
            setAlbums(searchResults.albums.items);
        } else {
            setAlbums([]);
        }

        if (searchResults.tracks) {
            setSongs(searchResults.tracks.items);
        } else {
            setSongs([]);
        }

       
        setSearching(false);
    
    }

    return (
        <div className="homepage">
            <Container className="pt-4 search-bar">
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
            </Container>
            <Container className="search-results">
                {searching ? (
                    <h1 style={{color:"white"}}>Loading...</h1>
                ) : (
                    <Row className="">
                        {searchType === "all" && (
                            <>
                            
                            <CustomCardResult items={artists.slice(0, 4)} subtitleType="artist" all="true" />
                            <CustomCardResult items={albums.slice(0, 4)} subtitleType="album" all="true"/>
                            <CustomCardResult items={songs.slice(0, 4)} subtitleType="song" all="true"/>
                            </>
                        )}
                        {searchType === "artist" && <CustomCardResult items={artists} subtitleType="artist" all="false"/>}
                        {searchType === "album" && <CustomCardResult items={albums} subtitleType="album" all="false" />}
                        {searchType === "track" && <CustomTracklist items={songs} />}
                    </Row>
                    
                )}
            </Container>
        </div>
    );
}

export default Home;
