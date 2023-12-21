// import modules and components
import React, { useState, useEffect } from "react";
import { scaleSequential } from 'd3-scale';
import UserIcon from '../Assets/Icons/UserProfileIcon.png';
import { interpolateRgb } from 'd3-interpolate';
import { Link  } from 'react-router-dom';
import Loading from "./loading.jsx"

// Styles for links
const linkStyles = {
  textDecoration: 'none',
  color: 'inherit', 
};

// Spotify Client Credentials
const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";

function UserReviewResults({ reviews }) {
  // Create a color scale from green to red
  const colorScale = scaleSequential(interpolateRgb('rgb(189, 16, 16)', 'rgb(87, 163, 36)')).domain([0, 100]);

  // State variables for album results and loading state
  const [albumResults, setAlbumResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch album information based on the review's albumId
  async function fetchAlbumInfo(albumId) {
    try {
      const token = await fetchAccessToken(); // Fetch access token
      const albumEndpoint = `https://api.spotify.com/v1/albums/${albumId}`;
      const albumInfo = await performSearch(token, albumEndpoint); // Fetch album information
      return albumInfo;
    } catch (error) {
      console.error('Error fetching album info:', error);
      return null;
    }
  }

  // Fetch data for all reviews
  const fetchAlbumData = async () => {
    try {
      for (const review of reviews) {
        const albumInfo = await fetchAlbumInfo(review.albumId);
        setAlbumResults(prevAlbumResults => [...prevAlbumResults, albumInfo]);
      }
    } catch (error) {
      console.error('Error fetching album data:', error);
    }
    setLoading(false);
  };

  // Use effect to fetch album data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAlbumData();
      } catch (error) {
        console.error('Error fetching album data:', error);
      }
    };
    fetchData(); // Fetch data on component mount
  }, []); // Empty dependency array ensures this runs only once

  // Function to fetch Spotify access token
  async function fetchAccessToken() {
    // Request parameters for getting the token
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }
    // Fetch the token and return it
    const data = await fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json());
    return data.access_token;
  }

  // Function to perform a search at a given endpoint via Spotify API
  async function performSearch(token, spotifyEndpoint) {
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
    } catch (error) {
      console.error('Error searching:', error);
    }
    return [];
  }

  // Rendering the reviews and album information
  return (
    <div className="reviews-container">
      {loading ? (
        <Loading />
      ) : (
        reviews.map((review, index) => (
          <div key={index} className="review-row">
            {/* Display individual review content */}
            <hr className="separator" />
            <div className="review-columns">
              <div className="album-column">
                <Link to={`/album/${review.albumId}`} style={linkStyles}>
                  <img
                    src={albumResults[index]?.images[0]?.url}
                    style={{ width: '200px', height: '200px' }}
                    alt={`Album ${index}`}
                  />
                </Link>
              </div>
              <div className="review-details">
                <div className="user-score review-text">
                  {/* Header with album and user information */}
                  <div className="review-head">
                    {/* Link to album details */}
                    <div className="review-album-head">
                      <Link to={`/album/${review.albumId}`} style={linkStyles}>
                        <p className="review-author-alt">{albumResults[index].name}</p>
                      </Link>
                      <Link to={`/artist/${albumResults[index].artists[0].id}`} style={linkStyles}>
                        <p className="review-author-album">By {albumResults[index].artists[0].name}</p>
                      </Link>
                    </div>
                    {/* Link to user profile and user information */}
                    <div className="review-user-head">
                      <Link to={`/user/${review.userId}`} style={linkStyles}>
                        <img
                          src={UserIcon}
                          style={{ width: '50px', height: '50px' }}
                          className="review-profile"
                          alt="User Profile"
                        />
                      </Link>
                      <Link to={`/user/${review.userId}`} style={linkStyles}>
                        <p className="review-author">{review.username}</p>
                      </Link>
                      {/* Review score and colored bar */}
                      <div className="score-container">
                        <p className="score-text">{review.score}</p>
                        <div className="score-bar">
                          <div
                            style={{
                              background: colorScale(review.score),
                              width: `${review.score}%`,
                              height: '100%',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Review body */}
                <div className="review-text">
                  {review.reviewbody.trim() !== '' ? (
                    <p>{review.reviewbody}</p>
                  ) : (
                    <p>No review given</p>
                  )}
                </div>
                {/* Review date */}
                <div className="review-date">
                  <p>
                    Reviewed on: {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      <hr className="separator" />
    </div>
  );
}

export default UserReviewResults;