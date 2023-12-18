import React, {useEffect, useState} from 'react'
import {useNavigate, Link} from "react-router-dom"
import axios from "axios"

import IconLogo from '../Assets/Icons/IconLogo.png'
import PasswordHide from '../Assets/Icons/PasswordHide.png'
import PasswordShown from '../Assets/Icons/PasswordShown.png'
import './review.css'



function Review() {

    const history=useNavigate();


    const [reviewBody, setReviewBody] = useState('')
    const [score, setScore] = useState('')



    async function submit(e){
        e.preventDefault()

        try {

            await axios.post("http://localhost:3000/review", {
                score,  reviewBody
            })
            .then(res=>{
              
            })
            .catch(e=> {
               
            })
            

        } catch(e) {
            console.log(e)
        }
    }


    return (
        <div className = 'review-container'>        
            <form action="POST">
                <div className="inputs">
             
                  
                    <div className = "input-text">
                        
                        <textarea id = "review-score" className = 'review-score' maxLength={3} onChange = {(e)=>{setScore(e.target.value)}} 
                        placeholder = "0-100" 
                        rows={1} // Number of visible text lines
                        cols={5} // Width of the textarea (in characters)
                        wrap="soft" />
                        
                    </div>
                   
              
              
                   
                    <div className = "input-text">
                        <textarea id = "review-score" className = 'review-body' maxLength={2000} onChange = {(e)=>{setScore(e.target.value)}} 
                        placeholder = "Write your review" 
                         // Number of visible text lines
                        cols={100} // Width of the textarea (in characters)
                        wrap="soft" />
                    </div>
               

                
                </div>

                
                
            </form>
           
        </div>
    )
}

export default Review