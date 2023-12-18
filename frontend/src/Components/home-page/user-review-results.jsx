
import React, { useState, useEffect, useRef  } from "react";
import { scaleSequential } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import { Link  } from 'react-router-dom';
import Loading from "./loading.jsx"

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

const CLIENT_ID = "5d8c84c59ac8435e91aa1c9d5d2e9706";
const CLIENT_SECRET = "93799cce40b641bb951a9b6966e3f2c0";


function UserReviewResults({ reviews }) {
  // Create a color scale from green to red
  const colorScale = scaleSequential(interpolateRgb('rgb(189, 16, 16)', 'rgb(87, 163, 36)')).domain([0, 100]);

  const [albumResults, setAlbumResults] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("REVIEW THINGS: ", reviews, reviews[0]);

 
 
   



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

  const fetchAlbumData = async () => {
    try {
     
      for (const review of reviews) {
        
        const albumInfo = await fetchAlbumInfo(review.albumId);
        
        setAlbumResults(prevAlbumResults => [...prevAlbumResults, albumInfo]);

      }
   
  
      console.log("ALBUM RESULTS: ", albumResults);

    } catch (error) {
      console.error('Error fetching album data:', error);
    }

    setLoading(false);
  };

  // Immediately invoked function to fetch album data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching album data...");
        await fetchAlbumData();
      } catch (error) {
        console.error('Error fetching album data:', error);
      }
    };
  
    fetchData(); // Call the function inside useEffect
  
  }, []); // Empty dependency array ensures this runs only once
  



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

  async function performSearch(token, spotifyEndpoint) {

    console.log("performing search...")
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
        console.log("RESPONSE: ", response)
    } catch (error) {
        console.error('Error searching:', error);
    }

    return [];
  }





  return (
    <div className="reviews-container">
      {loading ? (
        <Loading />
      ) : (
        reviews.map((review, index) => (
          <div key={index} className="review-row">
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


                  <div className = "review-head">

                    <div className = "review-album-head">
                      <Link to={`/album/${review.albumId}`} style={linkStyles}>
                        <p className="review-author-alt">{albumResults[index].name}</p>
                      </Link>
                      <Link to={`/artist/${albumResults[index].artists[0].id}`} style={linkStyles}>
                        <p className="review-author-album">By {albumResults[index].artists[0].name}</p>
                      </Link>

                    
                    </div>

                    <div className = "review-user-head">
                      <Link to={`/user/${review.userId}`} style={linkStyles}>
                        <img
                          src={'https://cdn.discordapp.com/attachments/1098384619591696427/1185775745373573160/UserProfileIcon.png?ex=6590d6b8&is=657e61b8&hm=fcec25082158a3bd53e0e20f38f3a83c8cfdd532bd15eae8de0bcb0b94c6b984&'}
                          style={{ width: '50px', height: '50px' }}
                          className="review-profile"
                          alt="User Profile"
                        />
                      </Link>
                      <Link to={`/user/${review.userId}`} style={linkStyles}>
                        <p className="review-author">{review.username}</p>
                      </Link>

                    

                 
                      {/* Score and colored bar */}
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
