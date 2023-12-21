import React from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import { Link  } from 'react-router-dom';
import UserIcon from '../Assets/Icons/UserProfileIcon.png';

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

function ReviewResults({ reviews }) {
  // Create a color scale from green to red
  const colorScale = scaleSequential(interpolateRgb('rgb(189, 16, 16)', 'rgb(87, 163, 36)')).domain([0, 100]);

  return (
    <div className="reviews-container">
     
      {reviews.map((review, index) => (
       
        <div key={index} className="review-row">
          <hr className="separator" />
          <div className="user-score review-text">
            {/* Username */}

            
           
              <Link to={`/user/${review.userId}`} style={linkStyles}>
                <img src = {UserIcon}
                    style={{ width: '50px', height: '50px' }}
                    className = 'review-profile'
                />
              </Link>
              
              <Link to={`/user/${review.userId}`} style={linkStyles}>
                <p className = "review-author">{review.username}</p>
              </Link>

            
         
            {/* Score and colored bar */}
            <div className="score-container">

              
              <p className = "score-text">{review.score}</p>
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
      ))}
      <hr className="separator" />
    </div>
  );
}

export default ReviewResults;
