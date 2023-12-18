import React, { useState, useEffect } from "react";

import axios from 'axios';
import { Link } from 'react-router-dom'; 

import './review.css';


function Review({albumId}) {

  console.log(albumId);
  const [reviewBody, setReviewBody] = useState('');
  const [score, setScore] = useState('');
  const [userData, setUserData] = useState(null);
  const [errorMessage, setErrorMessage]= useState('');
  

 




  async function submitScore(e) {
    e.preventDefault();
    try {

      await axios.post("http://localhost:3000/review", {
          albumId, score, reviewBody
      })
      .then(res=>{
          if(res.data==="Invalid score!"){
              setErrorMessage(res.data)
          } else if(res.data==="Valid score!"){
            window.location.reload();
          } 
      })
      .catch(e=> {
          setErrorMessage("Invalid score!")
          console.log(e);
      })
      

  } catch(e) {
      console.log(e)
  }
  }
  


  return (
    <div className="review-container mb-3">
      <form action="POST">
        <div className="review-inputs">
          <div className="review-item score">
           
            <textarea
              id="review-score"
              className="review-score"
              maxLength={3}
              onChange={(e) => {
                setScore(e.target.value);
              }}
              placeholder="0-100"
              rows={1}
              cols={5}
              wrap="soft"
            />
            <button className = 'rate-button' onClick={submitScore}>RATE</button>
            <p className = 'review-error'>{errorMessage}</p>
          </div>
          <div className="review-item revbody">
            <textarea
              id="review-body"
              className="review-body"
              maxLength={5000}
              onChange={(e) => {
                setReviewBody(e.target.value);
              }}
              placeholder="Write your review (optional)"
              cols={100}
              wrap="soft"
            />
            <button className = 'rate-button review-button' onClick={submitScore}>SUBMIT REVIEW</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Review;
